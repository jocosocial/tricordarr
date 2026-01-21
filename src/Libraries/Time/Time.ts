// https://github.com/bluesky-social/social-app/blob/main/src/state/queries/index.ts

const SECOND = 1e3;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

/**
 * Constant time values for use in queries.
 */
export const STALE = {
  SECONDS: {
    ONE: SECOND,
    THIRTY: 30 * SECOND,
  },
  MINUTES: {
    ONE: MINUTE,
    THREE: 3 * MINUTE,
    FIVE: 5 * MINUTE,
    THIRTY: 30 * MINUTE,
  },
  HOURS: {
    ONE: HOUR,
    TWENTY_FOUR: 24 * HOUR,
  },
  INFINITY: Infinity,
};
