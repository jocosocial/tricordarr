import React from 'react';

/**
 * Simple function debouncer.
 *
 * This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/lib/hooks/useDedupe.ts
 */

export const useDedupe = (timeout = 250) => {
  const canDo = React.useRef(true);

  return React.useCallback(
    (cb: () => unknown) => {
      if (canDo.current) {
        canDo.current = false;
        setTimeout(() => {
          canDo.current = true;
        }, timeout);
        cb();
        return true;
      }
      return false;
    },
    [timeout],
  );
};
