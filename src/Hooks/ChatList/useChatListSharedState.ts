import {useCallback, useEffect, useMemo, useRef} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {computeEndOffset} from '#src/Libraries/ChatList/Anchor';
import type {ScrollMetrics} from '#src/Libraries/ChatList/ScrollButtons';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('useChatListSharedState.ts');

/**
 * Mutable state that several ChatList concerns read and write. These are refs, not state: they change
 * on every scroll event and must never re-render the list. The object itself is stable for the life
 * of the list.
 */
export interface ChatListSharedState {
  /** Latest offset, viewport and content height, from onScroll (and patched by the page fill). */
  scrollMetrics: React.RefObject<ScrollMetrics | null>;
  /**
   * Whether the user is within a threshold of the bottom, as of the last scroll event. Gates the
   * re-pin on window resize and keyboard.
   */
  isNearBottom: React.RefObject<boolean>;
  /**
   * True while the user drags the list and through the fling that follows. A user scroll always
   * wins over the keyboard, resize and end re-pins. Android also fires the momentum events for
   * programmatic animated scrolls (scrollToEnd), so momentum only counts right after a drag ends.
   */
  userScrolling: React.RefObject<boolean>;
  /**
   * Until this time (ms), content growth while the list sits at the end re-pins the end. Set by the
   * scroll-to-bottom buttons and the page fill; cleared by a user drag.
   */
  endPinUntil: React.RefObject<number>;
  /**
   * Set when an older page is loaded into an end-anchored list that does not fill the viewport yet.
   * Such a list is bottom-aligned by a FlashList margin that goes away as it fills, which FlashList's
   * position correction does not count, so the end is pinned once the content outgrows the viewport.
   */
  pinEndOnFill: React.RefObject<boolean>;
  /** Whether `onReadyToShow` has fired (the list is at its initial position). */
  readyFired: React.RefObject<boolean>;
  /** Height of the list's container, from its onLayout. Null before the first layout. */
  containerHeight: React.RefObject<number | null>;
  /**
   * Near-bottom as of the moment the keyboard started to show or hide, before the resize could
   * disturb it. Cleared once the keyboard has settled.
   */
  keyboardPinned: React.RefObject<boolean>;
  /** Pending delayed keyboard re-pin. */
  keyboardPinTimer: React.RefObject<ReturnType<typeof setTimeout> | null>;
  /** Scrolls to the end on the next frame, replacing any pending re-pin. */
  scheduleRepin: () => void;
  /**
   * Cancels any pending keyboard or resize re-pin and closes the end-pin window. Called when the user
   * starts to drag, so the delayed re-pins after the keyboard closes don't pull a user who has started
   * scrolling back to the bottom.
   */
  cancelRepins: () => void;
  /** The furthest the list can scroll, from FlashList's own measurements. Undefined before layout. */
  getEndOffset: () => number | undefined;
}

/**
 * Creates the refs and re-pin scheduling shared by ChatList's concern hooks (see
 * `ChatListSharedState`). Cancels its pending frame on unmount: parent screens remount the list via
 * `key`, and a callback from a replaced instance must never move the new one.
 */
export const useChatListSharedState = <TItem>(listRef: TChatListRefObject<TItem>): ChatListSharedState => {
  const scrollMetrics = useRef<ScrollMetrics | null>(null);
  const isNearBottom = useRef(true);
  const userScrolling = useRef(false);
  const endPinUntil = useRef(0);
  const pinEndOnFill = useRef(false);
  const readyFired = useRef(false);
  const containerHeight = useRef<number | null>(null);
  const keyboardPinned = useRef(false);
  const keyboardPinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizePinFrame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resizePinFrame.current !== null) {
        cancelAnimationFrame(resizePinFrame.current);
      }
    };
  }, []);

  const scheduleRepin = useCallback(() => {
    if (resizePinFrame.current !== null) {
      cancelAnimationFrame(resizePinFrame.current);
    }
    resizePinFrame.current = requestAnimationFrame(() => {
      resizePinFrame.current = null;
      listRef.current?.scrollToEnd({animated: false});
    });
  }, [listRef]);

  const cancelRepins = useCallback(() => {
    keyboardPinned.current = false;
    endPinUntil.current = 0;
    if (keyboardPinTimer.current !== null) {
      clearTimeout(keyboardPinTimer.current);
      keyboardPinTimer.current = null;
    }
    if (resizePinFrame.current !== null) {
      cancelAnimationFrame(resizePinFrame.current);
      resizePinFrame.current = null;
    }
  }, []);

  const getEndOffset = useCallback((): number | undefined => {
    const list = listRef.current;
    if (!list) {
      return undefined;
    }
    try {
      return computeEndOffset(
        list.getChildContainerDimensions().height,
        list.getFirstItemOffset(),
        list.getWindowSize().height,
      );
    } catch (error) {
      logger.debug('getEndOffset measurement unavailable', error);
      return undefined;
    }
  }, [listRef]);

  return useMemo(
    () => ({
      scrollMetrics,
      isNearBottom,
      userScrolling,
      endPinUntil,
      pinEndOnFill,
      readyFired,
      containerHeight,
      keyboardPinned,
      keyboardPinTimer,
      scheduleRepin,
      cancelRepins,
      getEndOffset,
    }),
    [scheduleRepin, cancelRepins, getEndOffset],
  );
};
