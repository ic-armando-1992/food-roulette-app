const { expo } = require('./app.json');

const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const iosUrlScheme = iosClientId?.endsWith('.apps.googleusercontent.com')
  ? `com.googleusercontent.apps.${iosClientId.slice(0, -'.apps.googleusercontent.com'.length)}`
  : null;

module.exports = {
  expo: {
    ...expo,
    plugins: [
      ...expo.plugins,
      ...(iosUrlScheme
        ? [
            [
              'react-native-nitro-google-signin',
              {
                iosUrlScheme,
              },
            ],
          ]
        : []),
    ],
  },
};
