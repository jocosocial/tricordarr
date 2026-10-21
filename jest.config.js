module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: ['node_modules/(?!((jest-)?react-native|@react-native(-community)?|url-join)/)'],
  moduleNameMapper: {
    // node-ical's real entry point pulls in an ESM-only `uuid` dependency this project's Jest
    // config doesn't transform. See tests/__mocks__/node-ical.js.
    '^node-ical$': '<rootDir>/tests/__mocks__/node-ical.js',
  },
};
