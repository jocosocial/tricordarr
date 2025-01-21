import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import React, {PropsWithChildren} from 'react';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {SharedValue} from 'react-native-reanimated';
import {SwipeableMethods} from 'react-native-gesture-handler/src/components/ReanimatedSwipeable.tsx';

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
}: BaseSwipeableProps) => {
  const {appConfig} = useConfig();
  return (
    <Swipeable
      enabled={enabled}
      renderRightActions={appConfig.userPreferences.reverseSwipeOrientation ? renderLeftPanel : renderRightPanel}
      renderLeftActions={appConfig.userPreferences.reverseSwipeOrientation ? renderRightPanel : renderLeftPanel}
      overshootFriction={overshootFriction}
      onSwipeableOpen={onSwipeableOpen}
      leftThreshold={leftThreshold}
      rightThreshold={rightThreshold}
      onSwipeableWillOpen={onSwipeableWillOpen}
      overshootRight={overshootRight}
      overshootLeft={overshootLeft}>
      {children}
    </Swipeable>
  );
};
