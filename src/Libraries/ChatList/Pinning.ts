/**
 * Keeping the list pinned to its end when things outside a scroll move it.
 *
 * - Keyboard and window resizes: the KeyboardAvoidingView around the list and composer resizes the
 *   list container, frame by frame on Android. FlashList's own autoscroll on resize is off while newer
 *   pages exist and for lists that do not follow the tail, so any resize while the user was near the
 *   bottom re-pins the end. There are no keyboard listeners (see `useChatListResizePin`).
 * - Content growth after a scroll-to-bottom press: a tall last post whose image measures in after
 *   landing (or a page that arrives) would leave the list short of the bottom with the buttons
 *   already hidden, so the end stays pinned for `END_PIN_MS`.
 * - Page fill of a short end-anchored list (see `Pagination.ts`).
 *
 * A user scroll always wins over all of these. These predicates are called only by the scroll
 * arbiter (`ScrollArbiter.ts`), which holds the state they read and says how a gesture is tracked.
 */

import {AT_BOTTOM_EPSILON} from '#src/Libraries/ChatList/Constants';
import {getDistanceFromBottom, ScrollMetrics} from '#src/Libraries/ChatList/ScrollButtons';

/**
 * Whether the content outgrew the viewport while a page-fill pin is pending.
 *
 * @param pinEndOnFill Whether a page-fill pin is pending.
 * @param viewportHeight Container height, or null before layout.
 * @param contentHeight New content height.
 */
export const hasOutgrownViewport = (pinEndOnFill: boolean, viewportHeight: number | null, contentHeight: number) =>
  pinEndOnFill && viewportHeight !== null && contentHeight > viewportHeight + 1;

/**
 * Whether content growth should re-pin the end: the list sat at the end before the growth, the
 * content grew, the end-pin window is open, and the user is not scrolling. Not mid-animation: the
 * list is only "at the end" once it has landed.
 *
 * @param params.metrics Scroll metrics from before the change.
 * @param params.contentHeight New content height.
 * @param params.now Current time (ms).
 * @param params.endPinUntil End of the end-pin window (ms).
 * @param params.userScrolling Whether the user is dragging or flinging.
 */
export const shouldRepinOnContentGrowth = ({
  metrics,
  contentHeight,
  now,
  endPinUntil,
  userScrolling,
}: {
  metrics: ScrollMetrics;
  contentHeight: number;
  now: number;
  endPinUntil: number;
  userScrolling: boolean;
}) => {
  const wasAtEnd = getDistanceFromBottom(metrics) <= AT_BOTTOM_EPSILON;
  return wasAtEnd && contentHeight > metrics.contentHeight && now < endPinUntil && !userScrolling;
};

/**
 * Whether a container resize should re-pin the end: the height actually changed after the list was
 * revealed, the user is not scrolling, and the user was near the bottom.
 *
 * @param params.previousHeight Container height before this layout, or null for the first layout.
 * @param params.height New container height.
 * @param params.ready Whether the list has been revealed.
 * @param params.userScrolling Whether the user is dragging or flinging.
 * @param params.nearBottom Near-bottom as of the last scroll event.
 */
export const shouldRepinOnResize = ({
  previousHeight,
  height,
  ready,
  userScrolling,
  nearBottom,
}: {
  previousHeight: number | null;
  height: number;
  ready: boolean;
  userScrolling: boolean;
  nearBottom: boolean;
}) => previousHeight !== null && previousHeight !== height && ready && !userScrolling && nearBottom;
