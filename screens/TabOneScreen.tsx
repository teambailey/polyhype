import React, { useState } from 'react';
import { StyleSheet, Button, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

import { Text, View } from '../components/Themed';

const PolyHype = () => {
  const [loading, udLoading] = useState<boolean>();
  const [recording, udRecording] = useState<any>(null);
  const [s, udSound] = useState(null);
  const [recordingPerms, upRecordingPerms] = useState<boolean>();
  const [playing, udPlaying] = useState<boolean>();

  const getPerms = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const granted = response.status === 'granted';
    upRecordingPerms(granted);
  };

  const playPause = () => {
    if (playing) s && s.pauseAsync();
    else s && s.playAsync();
  };

  const stopAudio = () => s && s.stopAsync();

  const stopPlayback = async () => {
    if (s) {
      await s.unloadAsync();
      s.setOnPlaybackStatusUpdate(null);
      udSound(null);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    recording && recording.setOnRecordingStatusUpdate(null);
  };

  const startRecord = async () => {
    // full stop of playback
    stopPlayback();
    udRecording(new Audio.Recording());

    // const recordingSettings = JSON.parse(
    //   JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY)
    // );

    // await recording.prepareToRecordAsync(recordingSettings);
    // recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    try {
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      // You are now recording!
    } catch (error) {
      // An error occurred!
    }

    udLoading(false);
  };

  const endRecord = async () => {
    udLoading(true);
    // full stop of playback
    stopPlayback();

    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }

    const info = await FileSystem.getInfoAsync(recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      // playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    const { sound } = await recording.createNewLoadedSoundAsync({
      isLooping: true,
      isMuted: false,
      volume: 1.0,
      rate: 1.0,
      shouldCorrectPitch: true,
    });

    udSound(sound);
    udLoading(false);
  };

  const airHorn = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require('../assets/sounds/air-horn.mp3'));
      await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      console.log('error happening');

      // An error occurred!
    }
  };

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
        <TouchableOpacity
          style={styles.btn}
          onPress={() => console.log('start')}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>Start Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => console.log('stop')}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>End Recording</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'blue',
    borderRadius: 8,
    margin: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PolyHype;
