import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shaktipanchang.app',
  appName: 'Shakti Panchang',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
