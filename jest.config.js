module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|query-string|decode-uri-component|split-on-first|filter-obj|nanoid|url-join)/)',
  ],
  moduleNameMapper: {
    // node-ical's real entry point pulls in an ESM-only `uuid` dependency this project's Jest
    // config doesn't transform. See tests/__mocks__/node-ical.js.
    '^node-ical$': '<rootDir>/tests/__mocks__/node-ical.js',
  },
};
