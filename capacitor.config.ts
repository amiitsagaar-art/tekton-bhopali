import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tekton.bhopal',
  appName: 'Tekton Bhopal',
  webDir: 'out',
  server: {
    // Points to the live Vercel deployment — any web updates will instantly
    // reflect in the mobile app without rebuilding the APK.
    url: "https://tekton-bhopali.vercel.app",
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
