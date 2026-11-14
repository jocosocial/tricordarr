import React, {PropsWithChildren} from 'react';
import Swipeable, {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {ReduceMotion, SharedValue, useReducedMotion} from 'react-native-reanimated';

import {useConfig} from '#src/Context/Contexts/ConfigContext';

export type RenderPanelFunction = (
  progress: SharedValue<number>,
  translation: SharedValue<number>,
  swipeableMethods: SwipeableMethods,
) => React.ReactNode;

export interface BaseSwipeableProps extends PropsWithChildren {
  enabled?: boolean;
  renderLeftPanel?: RenderPanelFunction;
  renderRightPanel?: RenderPanelFunction;
}

/**
 * Settle animation used when the system has animations turned off (Android: "Remove animations",
 * or Developer options > Transition animation scale = off).
 *
 * ReanimatedSwipeable settles with `reduceMotion: ReduceMotion.System`, which under reduced motion
 * turns the spring into a single synchronous value set with no animation frame requested. On
 * Android that lone update is not flushed to the screen: a row released part-way stays frozen at
 * the release position until something unrelated (a re-render, another touch) triggers a flush,
 * then jumps open or closed. Measured on a Pixel 11 Pro: 300ms+ frozen, versus 8ms to the first
 * spring frame with animations on.
 *
 * Opting out of the reduced-motion shortcut and using a spring stiff enough to land within a frame
 * keeps the "no animation" look while going through the animation-frame path, which does flush.
 */
const REDUCED_MOTION_ANIMATION_OPTIONS = {
  reduceMotion: ReduceMotion.Never,
  mass: 1,
  damping: 2000,
  stiffness: 1000000,
};

/**
 * Shared wrapper around RNGH's ReanimatedSwipeable for list rows. Swaps the left and right panels
 * when the reverse swipe orientation preference is set and disables overshoot. Implementors must
 * pass a `key` (the item id) so a recycled list cell remounts closed instead of showing the
 * previous item's open state.
 */
export const BaseSwipeable = ({enabled = true, children, renderRightPanel, renderLeftPanel}: BaseSwipeableProps) => {
  const {appConfig} = useConfig();
  const reducedMotion = useReducedMotion();
  return (
    <Swipeable
      enabled={enabled}
      dragOffsetFromLeft={20}
      dragOffsetFromRight={-20}
      renderRightActions={appConfig.userPreferences.reverseSwipeOrientation ? renderLeftPanel : renderRightPanel}
      renderLeftActions={appConfig.userPreferences.reverseSwipeOrientation ? renderRightPanel : renderLeftPanel}
      animationOptions={reducedMotion ? REDUCED_MOTION_ANIMATION_OPTIONS : undefined}
      overshootRight={false}
      overshootLeft={false}>
      {children}
    </Swipeable>
  );
};
