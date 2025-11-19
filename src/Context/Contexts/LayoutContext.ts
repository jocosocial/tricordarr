import {createContext, useContext} from 'react';
import {SharedValue} from 'react-native-reanimated';

interface LayoutContextType {
  headerHeight: SharedValue<number>;
  footerHeight: SharedValue<number>;
  headerHeightValue: number;
  footerHeightValue: number;
}

/**
 * Context for layout information.
 *
 * This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/state/shell/shell-layout.tsx
 */
export const LayoutContext = createContext<LayoutContextType>({
  headerHeight: {
    value: 0,
    addListener() {},
    removeListener() {},
    modify() {},
    get() {
      return 0;
    },
    set() {},
  },
  footerHeight: {
    value: 0,
    addListener() {},
    removeListener() {},
    modify() {},
    get() {
      return 0;
    },
    set() {},
  },
  headerHeightValue: 0,
  footerHeightValue: 0,
});

export const useLayout = () => useContext(LayoutContext);
