import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

import { Text, View } from '../components/Themed';

const PolyHype = () => {
  const [loading, udLoading] = useState<boolean>(false);
  const [recording, udRecording] = useState<any>(null);
  const [s, udSound] = useState<any>(null);
  const [recordingPerms, upRecordingPerms] = useState<boolean>(false);
  const [playing, udPlaying] = useState<boolean>(false);

  const DEFAULT_AUDIO_SETTINGS = {
    allowsRecordingIOS: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    // shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: true,
    // staysActiveInBackground: true,
    volume: 1.0,
  };

  const RECORDED_AUDIO_SETTINGS = {
    // isLooping: true,
    isMuted: false,
    volume: 1.0,
    rate: 1.0,
    // shouldCorrectPitch: true,
  };

  const getPerms = async () => {
    if (!recordingPerms) {
      const response = await Permissions?.askAsync(Permissions.AUDIO_RECORDING);
      const granted = response?.status === 'granted';
      upRecordingPerms(granted);
    }
  };

  // _updateScreenForSoundStatus = status => {
  //   if (status.isLoaded) {
  //     this.setState({
  //       soundDuration: status.durationMillis,
  //       soundPosition: status.positionMillis,
  //       shouldPlay: status.shouldPlay,
  //       isPlaying: status.isPlaying,
  //       rate: status.rate,
  //       muted: status.isMuted,
  //       volume: status.volume,
  //       shouldCorrectPitch: status.shouldCorrectPitch,
  //       isPlaybackAllowed: true,
  //     });
  //   } else {
  //     this.setState({
  //       soundDuration: null,
  //       soundPosition: null,
  //       isPlaybackAllowed: false,
  //     });
  //     if (status.error) {
  //       console.log(`FATAL PLAYER ERROR: ${status.error}`);
  //     }
  //   }
  // };

  // _updateScreenForRecordingStatus = status => {
  //   if (status.canRecord) {
  //     this.setState({
  //       isRecording: status.isRecording,
  //       recordingDuration: status.durationMillis,
  //     });
  //   } else if (status.isDoneRecording) {
  //     this.setState({
  //       isRecording: false,
  //       recordingDuration: status.durationMillis,
  //     });
  //     if (!this.state.isLoading) {
  //       this._stopRecordingAndEnablePlayback();
  //     }
  //   }
  // };

  const playPause = async () => {
    if (playing) {
      await s?.pauseAsync();
      udPlaying(false);
    } else {
      await s?.playAsync();
      udPlaying(true);
    }
  };

  const stopAudio = async () => {
    await s?.stopAsync();
    udPlaying(false);
  };

  const stopPlayback = async () => {
    if (s) {
      s.unloadAsync();
      s.setOnPlaybackStatusUpdate(null);
      udSound(null);
      udPlaying(false);
    }

    // await Audio.setAudioModeAsync(DEFAULT_AUDIO_SETTINGS);

    // recording?.setOnRecordingStatusUpdate(null);
  };

  const startRecord = async () => {
    udLoading(true);
    // full stop of playback
    await stopPlayback();

    // get perms
    await getPerms();

    // assign new Audio
    const audio = new Audio.Recording();

    // audio.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    try {
      await audio.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await audio.startAsync();
      console.log('********* Started ************');
      // You are now recording!
    } catch (error) {
      console.log(error);
    }

    udRecording(audio);
  };

  const endRecord = async () => {
    udLoading(true);
    // full stop of playback
    await stopPlayback();

    try {
      await recording.stopAndUnloadAsync();
      console.log('************* Stopped ************');
    } catch (error) {
      console.log(error);
    }

    // const info = await FileSystem.getInfoAsync(recording.getURI());
    // console.log(`FILE INFO: ${JSON.stringify(info)}`);

    await Audio.setAudioModeAsync(DEFAULT_AUDIO_SETTINGS);

    const { sound } = await recording.createNewLoadedSoundAsync(
      RECORDED_AUDIO_SETTINGS
    );

    await udSound(sound);
    udLoading(false);
  };

  const defaultSoundObj = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject?.loadAsync(require('../assets/sounds/air-horn.mp3'));
      await Audio.setAudioModeAsync(DEFAULT_AUDIO_SETTINGS);
      udSound(soundObject);
    } catch (error) {
      console.log(error);
    }
  };

  const airHorn = async () => {
    // await stopAudio();
    // await stopPlayback();
    try {
      // await defaultSoundObj();
      await s?.setPositionAsync(0);
      s?.playAsync();
    } catch (error) {
      console.log('error happening');
    }
    udLoading(false);
  };

  useEffect(() => {
    console.log('firing');
    // get perms
    getPerms();
    defaultSoundObj();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.hypeButton} onPress={airHorn}>
          <LinearGradient
            colors={['#5F5CFF', '#0A0A0A']}
            style={styles.linearGradient}
          >
            <Text style={styles.buttonText}>HYPE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.btnGroup}>
        <TouchableOpacity style={styles.btn} onPress={() => startRecord()}>
          <Text style={{ color: '#fff', fontSize: 20 }}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => endRecord()}>
          <Text style={{ color: '#fff', fontSize: 20 }}>End</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => playPause()}>
          {!playing ? (
            <Text style={{ color: '#fff', fontSize: 20 }}>PLAY</Text>
          ) : (
            <Text style={{ color: '#fff', fontSize: 20 }}>PAUSE</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => stopAudio()}>
          <Text style={{ color: '#fff', fontSize: 20 }}>STOP</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const btnVars = {
  size: 200,
  radius: 100,
};

const styles = StyleSheet.create({
  hypeButton: {
    borderRadius: btnVars.radius,
  },
  linearGradient: {
    borderRadius: btnVars.radius,
    height: btnVars.size,
    width: btnVars.size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,

    elevation: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    lineHeight: 0,
  },
  btnGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'blue',
    borderRadius: 8,
    margin: 10,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PolyHype;
