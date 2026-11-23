
const config = {
  appId: "com.miniverse.app",
  appName: "MiniVerse",

  // Vite production build output.
  // This path is relative to the mobile directory.
  webDir: "../client/dist",

  android: {
    path: "android",
    backgroundColor: "#0B1020",
    allowMixedContent: false,
  },

  server: {
    androidScheme: "https",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0B1020",
      showSpinner: false,
    },
  },
};

export default config;
