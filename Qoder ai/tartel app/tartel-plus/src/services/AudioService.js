import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.soundObject = null;
    this.recordingObject = null;
    this.isRecording = false;
    this.isPlaying = false;
  }

  async initializeAudio() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false
      });
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async playAudio(uri) {
    try {
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }
      
      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync({ uri });
      await this.soundObject.playAsync();
      
      this.isPlaying = true;
      
      // Set up playback completion listener
      this.soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
        }
      });
      
      console.log('Audio playing:', uri);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async stopAudio() {
    try {
      if (this.soundObject) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
        this.soundObject = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async startRecording() {
    try {
      if (this.recordingObject) {
        await this.recordingObject.stopAndUnloadAsync();
      }
      
      this.recordingObject = new Audio.Recording();
      await this.recordingObject.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await this.recordingObject.startAsync();
      
      this.isRecording = true;
      console.log('Started recording');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  async stopRecording() {
    try {
      if (!this.recordingObject || !this.isRecording) {
        return null;
      }
      
      await this.recordingObject.stopAndUnloadAsync();
      const recordingUri = this.recordingObject.getURI();
      
      this.recordingObject = null;
      this.isRecording = false;
      
      console.log('Stopped recording:', recordingUri);
      return recordingUri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  async togglePlayback() {
    try {
      if (this.soundObject) {
        const status = await this.soundObject.getStatusAsync();
        if (status.isPlaying) {
          await this.soundObject.pauseAsync();
          this.isPlaying = false;
        } else {
          await this.soundObject.playAsync();
          this.isPlaying = true;
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }

  cleanup() {
    if (this.soundObject) {
      this.soundObject.unloadAsync();
    }
    if (this.recordingObject) {
      this.recordingObject.stopAndUnloadAsync();
    }
    this.isRecording = false;
    this.isPlaying = false;
  }
}

export default new AudioService();