import {useCallback} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';
import {shouldNudgeLoadPrevious} from '#src/Libraries/ChatList/Pagination';

interface UseChatListScrollHandlersProps {
  arbiter: ChatListScrollArbiter;
  hasPreviousPage?: boolean;
  handleLoadPrevious?: () => void;
  applyAtTop: (offset: number) => void;
  applyScrollButtonDirection: () => void;
}

/**
 * ChatList's FlashList scroll, content-size, drag and momentum handlers. They keep the scroll
 * metrics current and report each event to the scroll arbiter (`src/Libraries/ChatList/ScrollArbiter.ts`),
 * which tells the user's drags and flings apart from programmatic scrolls and decides the end
 * re-pins. They also feed the load-previous nudge and the scroll buttons.
 */
export const useChatListScrollHandlers = ({
  arbiter,
  hasPreviousPage,
  handleLoadPrevious,
  applyAtTop,
  applyScrollButtonDirection,
}: UseChatListScrollHandlersProps) => {
  const {styleDefaults} = useStyles();

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      const metrics = {
        offset: contentOffset.y,
        viewportHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
      };
      arbiter.scrollMetrics.current = metrics;
      arbiter.dispatch({
        type: 'scroll',
        metrics,
        threshold: styleDefaults.listScrollThreshold,
        margin: styleDefaults.marginSize,
      });
      applyAtTop(contentOffset.y);

      // FlashList's onStartReached stops firing after a few prepends that add less than a threshold of
      // content (Shopify/flash-list#1785), so also load older posts directly when near the top. The
      // pagination hook ignores calls while a fetch is in flight. Not before the initial position has
      // settled, when the offset is transiently 0.
      if (
        handleLoadPrevious &&
        shouldNudgeLoadPrevious({
          ready: arbiter.isReady(),
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
      arbiter,
      handleLoadPrevious,
      hasPreviousPage,
      styleDefaults.listScrollThreshold,
      styleDefaults.marginSize,
    ],
  );

  /**
   * The content grew or shrank without a scroll (a page loaded, an image measured). The arbiter
   * decides whether that re-pins the end. Re-derives the buttons, which may have hidden for a bottom
   * that has since moved away; the next scroll event refreshes everything else.
   */
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      const metrics = arbiter.scrollMetrics.current;
      arbiter.dispatch({type: 'contentSize', height, metrics, now: Date.now()});
      if (!metrics || metrics.contentHeight === height) {
        return;
      }
      arbiter.scrollMetrics.current = {...metrics, contentHeight: height};
      applyScrollButtonDirection();
    },
    [applyScrollButtonDirection, arbiter],
  );

  /** A user drag has started: the arbiter stops all re-pins. */
  const onScrollBeginDrag = useCallback(() => arbiter.dispatch({type: 'dragBegin'}), [arbiter]);

  /** A user drag has ended; a fling may follow (see onMomentumScrollBegin). */
  const onScrollEndDrag = useCallback(() => arbiter.dispatch({type: 'dragEnd', now: Date.now()}), [arbiter]);

  /** Momentum that starts as a drag ends is the user's fling; any other momentum is programmatic. */
  const onMomentumScrollBegin = useCallback(
    () => arbiter.dispatch({type: 'momentumBegin', now: Date.now()}),
    [arbiter],
  );

  /** A fling (or programmatic momentum) has ended. The arbiter resends a button scroll that ended short. */
  const onMomentumScrollEnd = useCallback(() => arbiter.dispatch({type: 'momentumEnd', now: Date.now()}), [arbiter]);

  return {
    onScroll,
    onContentSizeChange,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
  };
};
