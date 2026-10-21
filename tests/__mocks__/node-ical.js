// node-ical's real entry point pulls in an ESM-only `uuid` dependency that this project's
// Jest config doesn't transform. Nothing under tests/ exercises the calendar-feed-import
// code path that actually uses node-ical, so a minimal stub keeps that transitive import
// from breaking test suites that merely import the same file (e.g. src/Libraries/Schedule.ts).
module.exports = {
  async: {
    fromURL: () => {
      throw new Error('node-ical is mocked in tests; getCalFeedFromUrl is not covered here.');
    },
  },
};
