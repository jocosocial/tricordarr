import {useCallback, useEffect} from 'react';
import {Keyboard, LayoutChangeEvent} from 'react-native';

import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';

/**
 * Keeps ChatList on its last post while the keyboard (or a window resize) changes the list's height,
 * by reporting keyboard and container-layout events to the scroll arbiter. Returns the
 * `onContainerLayout` for the view that wraps the list. The challenge is described in
 * `src/Libraries/ChatList/Pinning.ts`, the decisions in `src/Libraries/ChatList/ScrollArbiter.ts`.
 *
 * Near-bottom is snapshotted when the keyboard starts moving (scroll events during the resize can
 * briefly report the user as far from the bottom). react-native-keyboard-controller's
 * KeyboardProvider emits the Will events on iOS, but they did not arrive on the Android emulator,
 * so the Did handler also accepts the near-bottom state at that moment.
 *
 * After the keyboard settles, a pinned list re-pins on the next frame and then at a few fixed
 * delays, unconditionally. On Android, closing the keyboard reported the list container as
 * transiently taller than its final size, and the final, smaller layout often never reached JS:
 * every JS-side measure (onLayout, FlashList's window size, the end offset) still said "at the bottom"
 * while the native view had shrunk and hid the last post. scrollToEnd goes through the native
 * scroll view, which knows the real size, and is a no-op when already at the end. Bounded; not a loop.
 * A user drag cancels the remaining re-pins.
 * The transient height came from Paper's BottomNavigation.Bar hiding itself on the keyboard
 * (keyboardHidesNavigationBar), which AppBottomTabBar now turns off. The delayed re-pins stay as
 * a fallback for other resizes that land after keyboardDidShow/Hide.
 */
export const useChatListKeyboardPin = (arbiter: ChatListScrollArbiter) => {
  /**
   * The KeyboardAvoidingView around the list and composer resizes this container, frame by frame on
   * Android. Any resize while the user was near the bottom re-pins the end (this also covers rotation
   * and split-screen resizes).
   */
  const onContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      arbiter.dispatch({type: 'resize', height: event.nativeEvent.layout.height});
    },
    [arbiter],
  );

  useEffect(() => {
    const onWill = () => arbiter.dispatch({type: 'keyboardWill'});
    const onDid = () => arbiter.dispatch({type: 'keyboardDid'});
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', onWill),
      Keyboard.addListener('keyboardWillHide', onWill),
      Keyboard.addListener('keyboardDidShow', onDid),
      Keyboard.addListener('keyboardDidHide', onDid),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [arbiter]);

  return {onContainerLayout};
};
