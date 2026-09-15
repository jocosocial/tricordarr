import React, {PropsWithChildren} from 'react';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SwipeableMethods} from 'react-native-gesture-handler/src/components/ReanimatedSwipeable';
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
  onSwipeableOpen?: (direction: 'left' | 'right') => void;
  onSwipeableWillOpen?: (direction: 'left' | 'right') => void;
  overshootRight?: boolean;
  overshootLeft?: boolean;
  leftThreshold?: number;
  rightThreshold?: number;
  overshootFriction?: number;
  friction?: number;
}

export const BaseSwipeable = ({
  enabled = true,
  children,
  renderRightPanel,
  renderLeftPanel,
  onSwipeableOpen,
  overshootRight = false,
  overshootLeft = false,
  leftThreshold,
  rightThreshold,
  overshootFriction = 8,
  onSwipeableWillOpen,
  friction = 1,
}: BaseSwipeableProps) => {
  const {appConfig} = useConfig();
  return (
    <Swipeable
      enabled={enabled}
      dragOffsetFromLeft={20}
      dragOffsetFromRight={-20}
      // failOffsetY is a custom prop added after upgrade to RN 86. FlashList + Swipeable
      // lists would "stick" when scrolling vertically. This provides a hint that
      // the Swipeable should not activate.
      failOffsetY={[-8, 8]}
      renderRightActions={appConfig.userPreferences.reverseSwipeOrientation ? renderLeftPanel : renderRightPanel}
      renderLeftActions={appConfig.userPreferences.reverseSwipeOrientation ? renderRightPanel : renderLeftPanel}
      overshootFriction={overshootFriction}
      onSwipeableOpen={onSwipeableOpen}
      leftThreshold={leftThreshold}
      rightThreshold={rightThreshold}
      onSwipeableWillOpen={onSwipeableWillOpen}
      friction={friction}
      overshootRight={overshootRight}
      overshootLeft={overshootLeft}>
      {children}
    </Swipeable>
  );
};
