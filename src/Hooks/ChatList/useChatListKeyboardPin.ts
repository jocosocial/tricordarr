import {useCallback, useEffect} from 'react';
import {Keyboard, LayoutChangeEvent} from 'react-native';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import type {ChatListSharedState} from '#src/Hooks/ChatList/useChatListSharedState';
import {KEYBOARD_SETTLE_DELAYS_MS} from '#src/Libraries/ChatList/Constants';
import {shouldPinAfterKeyboard, shouldRepinOnResize} from '#src/Libraries/ChatList/Pinning';

/**
 * Keeps ChatList on its last post while the keyboard (or a window resize) changes the list's height.
 * Returns the `onContainerLayout` for the view that wraps the list. The challenge is described in
 * `src/Libraries/ChatList/Pinning.ts`.
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
 * A user drag cancels the remaining re-pins (see `cancelRepins`).
 * The transient height came from Paper's BottomNavigation.Bar hiding itself on the keyboard
 * (keyboardHidesNavigationBar), which AppBottomTabBar now turns off. The delayed re-pins stay as
 * a fallback for other resizes that land after keyboardDidShow/Hide.
 */
export const useChatListKeyboardPin = <TItem>(listRef: TChatListRefObject<TItem>, shared: ChatListSharedState) => {
  /**
   * The KeyboardAvoidingView around the list and composer resizes this container, frame by frame on
   * Android. Any resize while the user was near the bottom re-pins the end (this also covers rotation
   * and split-screen resizes).
   */
  const onContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      const previous = shared.containerHeight.current;
      shared.containerHeight.current = height;
      if (
        shouldRepinOnResize({
          previousHeight: previous,
          height,
          ready: shared.readyFired.current,
          userScrolling: shared.userScrolling.current,
          nearBottom: shared.isNearBottom.current,
          keyboardPinned: shared.keyboardPinned.current,
        })
      ) {
        shared.scheduleRepin();
      }
    },
    [shared],
  );

  useEffect(() => {
    const onWill = () => {
      shared.keyboardPinned.current = shared.readyFired.current && shared.isNearBottom.current;
    };
    const onDid = () => {
      const pinned = shouldPinAfterKeyboard({
        userScrolling: shared.userScrolling.current,
        keyboardPinned: shared.keyboardPinned.current,
        ready: shared.readyFired.current,
        nearBottom: shared.isNearBottom.current,
      });
      shared.keyboardPinned.current = pinned;
      if (!pinned) {
        return;
      }
      shared.scheduleRepin();
      if (shared.keyboardPinTimer.current !== null) {
        clearTimeout(shared.keyboardPinTimer.current);
      }
      const repinAfter = (step: number) => {
        shared.keyboardPinTimer.current = setTimeout(() => {
          shared.keyboardPinTimer.current = null;
          listRef.current?.scrollToEnd({animated: false});
          if (step + 1 < KEYBOARD_SETTLE_DELAYS_MS.length) {
            repinAfter(step + 1);
          } else {
            shared.keyboardPinned.current = false;
          }
        }, KEYBOARD_SETTLE_DELAYS_MS[step]);
      };
      repinAfter(0);
    };
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', onWill),
      Keyboard.addListener('keyboardWillHide', onWill),
      Keyboard.addListener('keyboardDidShow', onDid),
      Keyboard.addListener('keyboardDidHide', onDid),
    ];
    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      if (shared.keyboardPinTimer.current !== null) {
        clearTimeout(shared.keyboardPinTimer.current);
      }
    };
  }, [listRef, shared]);

  return {onContainerLayout};
};
