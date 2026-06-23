import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.andresm777.rodrigosbooking',
  appName: "Rodrigo's Booking",
  webDir: 'dist',
  server: {
    // En producción usa la URL del gateway directamente (sin proxy de Vercel)
    url: undefined,
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
