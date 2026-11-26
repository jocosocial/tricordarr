import {useCallback, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import type {ChatListSharedState} from '#src/Hooks/ChatList/useChatListSharedState';
import {END_PIN_MS} from '#src/Libraries/ChatList/Constants';
import {shouldNudgeLoadPrevious} from '#src/Libraries/ChatList/Pagination';
import {hasOutgrownViewport, isUserFling, shouldRepinOnContentGrowth} from '#src/Libraries/ChatList/Pinning';
import {getDistanceFromBottom} from '#src/Libraries/ChatList/ScrollButtons';

interface UseChatListScrollHandlersProps {
  shared: ChatListSharedState;
  hasPreviousPage?: boolean;
  handleLoadPrevious?: () => void;
  applyAtTop: (offset: number) => void;
  applyScrollButtonDirection: () => void;
  clearButtonTargetIfReached: (offset: number, distanceFromBottom: number) => void;
  retryButtonScroll: () => void;
}

/**
 * ChatList's FlashList scroll, content-size, drag and momentum handlers. They keep the shared scroll
 * state current, tell the user's drags and flings apart from programmatic scrolls (a user scroll
 * always wins over re-pins, see `src/Libraries/ChatList/Pinning.ts`), and feed the other concerns:
 * the load-previous nudge, the scroll buttons, and the end re-pins.
 */
export const useChatListScrollHandlers = ({
  shared,
  hasPreviousPage,
  handleLoadPrevious,
  applyAtTop,
  applyScrollButtonDirection,
  clearButtonTargetIfReached,
  retryButtonScroll,
}: UseChatListScrollHandlersProps) => {
  const {styleDefaults} = useStyles();
  const dragEndedAtRef = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      const metrics = {
        offset: contentOffset.y,
        viewportHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
      };
      shared.scrollMetrics.current = metrics;
      const distanceFromBottom = getDistanceFromBottom(metrics);
      shared.isNearBottom.current = distanceFromBottom <= styleDefaults.listScrollThreshold;
      applyAtTop(contentOffset.y);
      clearButtonTargetIfReached(contentOffset.y, distanceFromBottom);

      // FlashList's onStartReached stops firing after a few prepends that add less than a threshold of
      // content (Shopify/flash-list#1785), so also load older posts directly when near the top. The
      // pagination hook ignores calls while a fetch is in flight. Not before the initial position has
      // settled, when the offset is transiently 0.
      if (
        handleLoadPrevious &&
        shouldNudgeLoadPrevious({
          ready: shared.readyFired.current,
          hasPreviousPage,
          offset: contentOffset.y,
          viewportHeight: layoutMeasurement.height,
        })
      ) {
        handleLoadPrevious();
      }

      applyScrollButtonDirection();
    },
    [
      applyAtTop,
      applyScrollButtonDirection,
      clearButtonTargetIfReached,
      handleLoadPrevious,
      hasPreviousPage,
      shared,
      styleDefaults.listScrollThreshold,
    ],
  );

  /**
   * The content grew or shrank without a scroll (a page loaded, an image measured). Re-derives the
   * buttons, which may have hidden for a bottom that has since moved away; the next scroll event
   * refreshes everything else. Within the button's end-pin window, growth while the list sat at the
   * end re-pins the end. Outgrowing the viewport after a page fill (see `pinEndOnFill`) opens the
   * same window.
   */
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (hasOutgrownViewport(shared.pinEndOnFill.current, shared.containerHeight.current, height)) {
        shared.pinEndOnFill.current = false;
        if (!shared.userScrolling.current) {
          shared.endPinUntil.current = Date.now() + END_PIN_MS;
          shared.scheduleRepin();
        }
      }
      const metrics = shared.scrollMetrics.current;
      if (!metrics || metrics.contentHeight === height) {
        return;
      }
      shared.scrollMetrics.current = {...metrics, contentHeight: height};
      if (
        shouldRepinOnContentGrowth({
          metrics,
          contentHeight: height,
          now: Date.now(),
          endPinUntil: shared.endPinUntil.current,
          userScrolling: shared.userScrolling.current,
        })
      ) {
        shared.scheduleRepin();
      }
      applyScrollButtonDirection();
    },
    [applyScrollButtonDirection, shared],
  );

  /** A user drag has started: stop all re-pins. */
  const onScrollBeginDrag = useCallback(() => {
    shared.userScrolling.current = true;
    shared.cancelRepins();
  }, [shared]);

  /** A user drag has ended; a fling may follow (see onMomentumScrollBegin). */
  const onScrollEndDrag = useCallback(() => {
    shared.userScrolling.current = false;
    dragEndedAtRef.current = Date.now();
  }, [shared]);

  /** Momentum that starts as a drag ends is the user's fling; any other momentum is programmatic. */
  const onMomentumScrollBegin = useCallback(() => {
    if (isUserFling(Date.now(), dragEndedAtRef.current)) {
      shared.userScrolling.current = true;
    }
  }, [shared]);

  /** A fling (or programmatic momentum) has ended. Resends a button scroll that ended short of its edge. */
  const onMomentumScrollEnd = useCallback(() => {
    retryButtonScroll();
    shared.userScrolling.current = false;
  }, [retryButtonScroll, shared]);

  return {
    onScroll,
    onContentSizeChange,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
  };
};
