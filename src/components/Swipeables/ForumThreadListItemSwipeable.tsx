import React, {PropsWithChildren} from 'react';
import Swipeable, {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';
import {SwipeableButton} from '../Buttons/SwipeableButton.tsx';
import {AppIcons} from '../../libraries/Enums/Icons.ts';
import {useAppTheme} from '../../styles/Theme.ts';

interface ForumThreadListItemSwipeableProps extends PropsWithChildren {}

export const ForumThreadListItemSwipeable = (props: ForumThreadListItemSwipeableProps) => {
  const theme = useAppTheme();

  const renderLeftPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <SwipeableButton
        text={'Mute'}
        iconName={AppIcons.mute}
        style={{backgroundColor: theme.colors.twitarrNegativeButton}}
        onPress={() => {
          console.log('mute');
          swipeable.reset();
        }}
      />
    );
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={'Event'}
          iconName={AppIcons.events}
          onPress={() => {
            console.log('event');
            swipeable.reset();
          }}
          style={{backgroundColor: theme.colors.twitarrNeutralButton}}
        />
        <SwipeableButton
          text={'Favorite'}
          iconName={AppIcons.favorite}
          onPress={() => {
            console.log('favorite');
            swipeable.reset();
          }}
        />
      </>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightPanel}
      renderLeftActions={renderLeftPanel}
      overshootFriction={3}>
      {props.children}
    </Swipeable>
  );
};
