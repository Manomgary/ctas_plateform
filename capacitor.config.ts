import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: '_ctas_collecte',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    "plugins": {
      "SplashScreen": {
        "launchShowDuration": 2000,
        "launchAutoHide": true,
        "backgroundColor": "#ffffffff",
        "androidSplashResourceName": "splash",
        "androidScaleType": "CENTER_CROP",
        /**"androidSpinnerStyle": "large",
        "iosSpinnerStyle": "small",
        "spinnerColor": "#999999",
        "showSpinner": true,*/
        "splashFullScreen": true,
        "splashImmersive": true
      }
    }
  }
};

export default config;
