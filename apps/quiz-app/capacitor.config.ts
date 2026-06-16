import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rashid.quizapp',
  appName: 'Quiz Master',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
      signingType: 'apksigner'
    }
  }
};

export default config;
