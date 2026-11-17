import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import {useContext} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Height at the bottom of the window that a Paper Menu must stay clear of, passed as its
 * `bottomInset` prop (added by our react-native-paper patch). Inside a tab navigator this is the
 * bottom tab bar, whose height already includes the bottom safe area; elsewhere it is the bottom
 * safe area inset alone (the Android navigation bar or the iOS home indicator).
 *
 * Paper measures against the full window, which under Android edge-to-edge includes the system
 * navigation bar, so without this a menu opened low on the screen draws over the tab bar or
 * underneath the navigation bar instead of flipping above its anchor.
 *
 * Call it in the menu component (in the navigator tree), not inside the menu's children: those
 * render in the Paper Portal and cannot see the tab bar context.
 */
export const useMenuBottomInset = () => {
  const insets = useSafeAreaInsets();
  // Raw context rather than useBottomTabBarHeight, which throws outside a tab navigator.
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  return Math.max(insets.bottom, tabBarHeight ?? 0);
};
