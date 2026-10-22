import React, {PropsWithChildren} from 'react';
import Swipeable, {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

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
 * Shared wrapper around RNGH's ReanimatedSwipeable for list rows. Swaps the left and right panels
 * when the reverse swipe orientation preference is set and disables overshoot. Implementors must
 * pass a `key` (the item id) so a recycled list cell remounts closed instead of showing the
 * previous item's open state.
 */
export const BaseSwipeable = ({enabled = true, children, renderRightPanel, renderLeftPanel}: BaseSwipeableProps) => {
  const {appConfig} = useConfig();
  return (
    <Swipeable
      enabled={enabled}
      dragOffsetFromLeft={20}
      dragOffsetFromRight={-20}
      renderRightActions={appConfig.userPreferences.reverseSwipeOrientation ? renderLeftPanel : renderRightPanel}
      renderLeftActions={appConfig.userPreferences.reverseSwipeOrientation ? renderRightPanel : renderLeftPanel}
      overshootRight={false}
      overshootLeft={false}>
      {children}
    </Swipeable>
  );
};
