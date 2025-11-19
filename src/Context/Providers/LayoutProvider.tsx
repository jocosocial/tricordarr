import {PropsWithChildren, useMemo, useState} from 'react';
import {runOnJS, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

import {LayoutContext} from '#src/Context/Contexts/LayoutContext';

/**
 * Provider for layout information.
 *
 * This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/state/shell/shell-layout.tsx
 */
export const LayoutProvider = ({children}: PropsWithChildren) => {
  const headerHeight = useSharedValue(0);
  const footerHeight = useSharedValue(0);
  const [headerHeightValue, setHeaderHeightValue] = useState(0);
  const [footerHeightValue, setFooterHeightValue] = useState(0);

  // Sync SharedValues to regular state for use in render
  useAnimatedReaction(
    () => headerHeight.value,
    value => {
      runOnJS(setHeaderHeightValue)(value);
    },
  );

  useAnimatedReaction(
    () => footerHeight.value,
    value => {
      runOnJS(setFooterHeightValue)(value);
    },
  );

  const value = useMemo(
    () => ({headerHeight, footerHeight, headerHeightValue, footerHeightValue}),
    [headerHeight, footerHeight, headerHeightValue, footerHeightValue],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
