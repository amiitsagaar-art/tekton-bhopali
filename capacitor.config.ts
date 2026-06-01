import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tektonbhopal.app',
  appName: 'Tekton Bhopal',
  webDir: 'out',
  server: {
    // For local development on a physical device, uncomment below and use your machine's local IP (e.g., http://192.168.X.X:3000)
    // url: "http://10.0.2.2:3000", // Android emulator address for localhost
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;
