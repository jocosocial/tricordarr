import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {isIOS} from '#src/Libraries/Platform/Detection';

/**
 * `keyboardVerticalOffset` for a `KeyboardAvoidingView` (behavior='padding') mounted
 * near the root of a screen's own content — i.e. as a direct child of `AppView`, the
 * same nesting depth `AppView`'s own (now-removed) global KAV used to sit at.
 *
 * This is a heuristic, not a true measurement: `insets.top + insets.bottom` only
 * approximates the real requirement (the distance from the top of the KAV to the top
 * of the screen), and the `+40` compensates for home-button iPhones. See issue #573 —
 * `KeyboardStickyView`'s own translateY-based approach was tried for chat composers but
 * assumes the view's resting position is flush with the true screen bottom, which ours
 * is not (it sits above the bottom tab bar); it under-shifts by roughly the tab bar's
 * share of the screen. This heuristic-offset KAV is the confirmed-working fallback.
 */
export const useKeyboardVerticalOffset = () => {
  const insets = useSafeAreaInsets();
  let offset = insets.top + insets.bottom;
  if (isIOS && insets.bottom === 0) {
    offset += 40;
  }
  return offset;
};
