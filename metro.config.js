const path = require('path');

const {mergeConfig} = require('@react-native/metro-config');
const {getDefaultConfig} = require('expo/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '#src': path.resolve(__dirname, 'src'),
      '#assets': path.resolve(__dirname, 'assets'),
      '#specs': path.resolve(__dirname, 'specs'),
    },
    // https://github.com/vonovak/react-navigation-header-buttons/blob/master/INSTALL.md
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
