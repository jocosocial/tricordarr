import {useCallback, useEffect, useMemo, useRef} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {computeEndOffset} from '#src/Libraries/ChatList/Anchor';
import {
  ArbiterEvent,
  initialScrollArbiterState,
  reduceScrollArbiter,
  ScrollArbiterState,
  ScrollCommand,
} from '#src/Libraries/ChatList/ScrollArbiter';
import type {ScrollMetrics} from '#src/Libraries/ChatList/ScrollButtons';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('useChatListScrollArbiter.ts');

/**
 * What ChatList's concern hooks share. Stable for the life of the list. Nothing in here re-renders
 * the list: it changes on every scroll event.
 */
export interface ChatListScrollArbiter {
  /** Reports an event to the arbiter, which runs whatever scrolls it calls for. */
  dispatch: (event: ArbiterEvent) => void;
  /** Whether the list is at its initial position and revealed. Read in callbacks, never in render. */
  isReady: () => boolean;
  /** Latest offset, viewport and content height, from onScroll (and patched by the page fill). */
  scrollMetrics: React.RefObject<ScrollMetrics | null>;
  /** Scroll events dispatched so far, so a caller can tell whether its own scroll has landed. */
  getScrollEventCount: () => number;
  /** The furthest the list can scroll, from FlashList's own measurements. Undefined before layout. */
  getEndOffset: () => number | undefined;
}

/**
 * Holds ChatList's scroll arbiter (`src/Libraries/ChatList/ScrollArbiter.ts`) and runs its commands.
 * This is the only code in ChatList's hooks that scrolls the list. It owns the pending frames behind
 * those scrolls and cancels them on unmount: parent screens remount the list via `key`, and a
 * callback from a replaced instance must never move the new one.
 */
export const useChatListScrollArbiter = <TItem>(listRef: TChatListRefObject<TItem>): ChatListScrollArbiter => {
  const stateRef = useRef<ScrollArbiterState>(initialScrollArbiterState);
  const scrollMetrics = useRef<ScrollMetrics | null>(null);
  const scrollEventCount = useRef(0);
  const repinFrame = useRef<number | null>(null);
  const ownItemFrame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (repinFrame.current !== null) {
        cancelAnimationFrame(repinFrame.current);
      }
      if (ownItemFrame.current !== null) {
        cancelAnimationFrame(ownItemFrame.current);
      }
    };
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

  return useMemo(() => {
    /** Runs one command from the reducer against the list. */
    const run = (command: ScrollCommand) => {
      switch (command.type) {
        case 'repin':
          if (repinFrame.current !== null) {
            cancelAnimationFrame(repinFrame.current);
          }
          repinFrame.current = requestAnimationFrame(() => {
            repinFrame.current = null;
            listRef.current?.scrollToEnd({animated: false});
          });
          return;
        case 'followOwnItem':
          if (ownItemFrame.current !== null) {
            cancelAnimationFrame(ownItemFrame.current);
          }
          ownItemFrame.current = requestAnimationFrame(() => {
            ownItemFrame.current = null;
            listRef.current?.scrollToEnd({animated: true});
          });
          return;
        case 'cancelPending':
          if (repinFrame.current !== null) {
            cancelAnimationFrame(repinFrame.current);
            repinFrame.current = null;
          }
          return;
        case 'scrollToEnd':
          listRef.current?.scrollToEnd({animated: command.animated});
          return;
        case 'scrollToOffset':
          listRef.current?.scrollToOffset({offset: command.offset, animated: command.animated});
          return;
        case 'scrollToIndex':
          void listRef.current?.scrollToIndex({
            index: command.index,
            animated: true,
            viewPosition: command.viewPosition,
          });
          return;
      }
    };

    /** Applies an event to the arbiter state and runs the commands it returns. */
    function dispatch(event: ArbiterEvent) {
      if (event.type === 'scroll') {
        scrollEventCount.current += 1;
      }
      const step = reduceScrollArbiter(stateRef.current, event);
      stateRef.current = step.state;
      step.commands.forEach(run);
    }

    return {
      dispatch,
      isReady: () => stateRef.current.phase === 'settled',
      scrollMetrics,
      getScrollEventCount: () => scrollEventCount.current,
      getEndOffset,
    };
  }, [getEndOffset, listRef]);
};
