import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rashid.kingcraftgame',
  appName: 'KingCraft',
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
