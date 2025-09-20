const path = require('path');

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

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
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
