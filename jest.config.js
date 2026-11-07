module.exports = {
  preset: '@react-native/jest-preset',
  // decode-uri-component is ESM-only (pinned by an npm override, see package.json), so Jest has to
  // transform it for the query-string interop test.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|url-join|decode-uri-component)/)',
  ],
  moduleNameMapper: {
    // node-ical's real entry point pulls in an ESM-only `uuid` dependency this project's Jest
    // config doesn't transform. See tests/__mocks__/node-ical.js.
    '^node-ical$': '<rootDir>/tests/__mocks__/node-ical.js',
  },
};
