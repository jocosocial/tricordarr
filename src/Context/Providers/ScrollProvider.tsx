import {PropsWithChildren, useMemo} from 'react';
import {type ScrollHandlers} from 'react-native-reanimated';

import {ScrollContext} from '#src/Context/Contexts/ScrollContext';

/**
 * Provider for scroll handlers.
 *
 * This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/lib/ScrollContext.tsx
 *
 * Note: this completely *overrides* the parent handlers.
 * It's up to you to compose them with the parent ones via useScrollHandlers() if needed.
 */
export const ScrollProvider = ({
  children,
  onBeginDrag,
  onEndDrag,
  onScroll,
  onMomentumEnd,
}: PropsWithChildren<ScrollHandlers<any>>) => {
  const handlers = useMemo(
    () => ({
      onBeginDrag,
      onEndDrag,
      onScroll,
      onMomentumEnd,
    }),
    [onBeginDrag, onEndDrag, onScroll, onMomentumEnd],
  );
  return <ScrollContext.Provider value={handlers}>{children}</ScrollContext.Provider>;
};
