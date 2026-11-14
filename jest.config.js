module.exports = {
  preset: '@react-native/jest-preset',
  // decode-uri-component is ESM-only (pinned by an npm override, see package.json), so Jest has to
  // transform it for the query-string interop test, along with query-string's own ESM-only deps.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|query-string|decode-uri-component|split-on-first|filter-obj|nanoid|url-join)/)',
  ],
  moduleNameMapper: {
    // node-ical's real entry point pulls in an ESM-only `uuid` dependency this project's Jest
    // config doesn't transform. See tests/__mocks__/node-ical.js.
    '^node-ical$': '<rootDir>/tests/__mocks__/node-ical.js',
  },
};
