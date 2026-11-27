import {useCallback} from 'react';
import {LayoutChangeEvent} from 'react-native';

import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';

/**
 * Keeps ChatList on its last post while its container changes height (the keyboard, rotation,
 * split-screen), by reporting container layouts to the scroll arbiter. Returns the
 * `onContainerLayout` for the view that wraps the list. The challenge is described in
 * `src/Libraries/ChatList/Pinning.ts`, the decision in `src/Libraries/ChatList/ScrollArbiter.ts`.
 *
 * There are no keyboard listeners. A delayed re-pin after keyboardDidShow/Hide used to cover Android
 * leaving the list one post short when the keyboard closed. That came from Paper's
 * BottomNavigation.Bar hiding itself on the keyboard (keyboardHidesNavigationBar), which resized the
 * screen a second time after the keyboard settled. AppBottomTabBar turns that off.
 */
export const useChatListResizePin = (arbiter: ChatListScrollArbiter) => {
  /**
   * The KeyboardAvoidingView around the list and composer resizes this container, frame by frame on
   * Android. Any resize while the user was near the bottom re-pins the end.
   */
  const onContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      arbiter.dispatch({type: 'resize', height: event.nativeEvent.layout.height});
    },
    [arbiter],
  );

  return {onContainerLayout};
};
