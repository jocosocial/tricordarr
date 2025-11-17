import {createContext, useContext} from 'react';
import {type ScrollHandlers} from 'react-native-reanimated';

/**
 * Context for scroll handlers.
 *
 * This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/lib/ScrollContext.tsx
 */

export const ScrollContext = createContext<ScrollHandlers<any>>({
  onBeginDrag: undefined,
  onEndDrag: undefined,
  onScroll: undefined,
  onMomentumEnd: undefined,
});

export const useScrollHandlers = () => useContext(ScrollContext);
