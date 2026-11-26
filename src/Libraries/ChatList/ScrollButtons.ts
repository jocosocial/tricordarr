/**
 * The floating scroll buttons (#583: up and down together).
 *
 * The primary button points toward the "New" divider when there is one, else down to the end; the
 * secondary button goes to the opposite edge. Scroll-to-top only greys out at the real beginning of
 * the conversation: while an older page exists the top is only a waypoint, and greying the button
 * for the moment the page takes to load made it flicker off and on.
 *
 * On Android, an animated scroll is cancelled wherever it is when the native
 * maintainVisibleContentPosition shifts the offset (FlashList's correction as a cell measures or a
 * page arrives). Right after a fling that happens often, and the button then seemed only to stop the
 * fling. So a button press records its target edge, and a scroll that ends short of it is sent again
 * within a bounded window and retry count. A touch on the list clears the target.
 */

import {AT_BOTTOM_EPSILON, BUTTON_SCROLL_MAX_RETRIES, BUTTON_SCROLL_WINDOW_MS} from '#src/Libraries/ChatList/Constants';

export type ScrollButtonDirection = 'up' | 'down' | null;

/** The list edge a scroll button sends the list to. */
export type ButtonScrollEdge = 'top' | 'end';

export interface ButtonScrollTarget {
  edge: ButtonScrollEdge;
  /** Time (ms) after which a short landing is left alone. */
  until: number;
  retries: number;
}

export interface ScrollMetrics {
  offset: number;
  viewportHeight: number;
  contentHeight: number;
}

/** Vertical extent of the "New" divider in scroll-offset coordinates (header height included). */
export interface DividerSpan {
  top: number;
  bottom: number;
}

/**
 * Distance from the viewport's bottom edge to the end of the content.
 *
 * @param metrics Latest scroll metrics.
 */
export const getDistanceFromBottom = (metrics: ScrollMetrics) =>
  metrics.contentHeight - metrics.viewportHeight - metrics.offset;

/**
 * Which floating scroll button to show. With a "New" divider the primary button points toward it;
 * without one (or before it is laid out) it points down. Hidden when the divider is in or within
 * `threshold` of the viewport, or the user is within `threshold` of the bottom.
 *
 * @param metrics Latest scroll metrics, or null before the first scroll event.
 * @param threshold `styleDefaults.listScrollThreshold`.
 * @param divider The divider's span, when there is a divider and it has a layout.
 */
export const getScrollButtonDirection = (
  metrics: ScrollMetrics | null,
  threshold: number,
  divider?: DividerSpan,
): ScrollButtonDirection => {
  if (!metrics) {
    return null;
  }
  if (getDistanceFromBottom(metrics) <= threshold) {
    return null;
  }
  if (!divider) {
    return 'down';
  }
  const viewportTop = metrics.offset;
  const viewportBottom = metrics.offset + metrics.viewportHeight;
  if (divider.bottom < viewportTop) {
    return viewportTop - divider.bottom <= threshold ? null : 'up';
  }
  if (divider.top > viewportBottom) {
    return divider.top - viewportBottom <= threshold ? null : 'down';
  }
  return null;
};

/**
 * Whether the list is at the real beginning of the conversation, where scroll-to-top has nothing to
 * do. Never true while an older page exists.
 *
 * @param offset Current scroll offset.
 * @param hasPreviousPage Whether an older page can still be loaded.
 * @param margin `styleDefaults.marginSize`, the slack allowed at the top.
 */
export const isAtTop = (offset: number, hasPreviousPage: boolean | undefined, margin: number) =>
  !hasPreviousPage && offset <= margin;

/**
 * Whether a button scroll has reached its edge, so the target can be cleared.
 *
 * @param edge The target edge.
 * @param offset Current scroll offset.
 * @param distanceFromBottom See `getDistanceFromBottom`.
 * @param margin `styleDefaults.marginSize`, the slack allowed at the top.
 */
export const hasReachedButtonEdge = (
  edge: ButtonScrollEdge,
  offset: number,
  distanceFromBottom: number,
  margin: number,
) => (edge === 'top' ? offset <= margin : distanceFromBottom <= AT_BOTTOM_EPSILON);

/**
 * A new target for a button press.
 *
 * @param edge The edge the button sends the list to.
 * @param now Current time (ms).
 */
export const createButtonScrollTarget = (edge: ButtonScrollEdge, now: number): ButtonScrollTarget => ({
  edge,
  until: now + BUTTON_SCROLL_WINDOW_MS,
  retries: 0,
});

/**
 * What to do when momentum ends while a button target is still set (the scroll ended short of its
 * edge): send it again, or give up once the window has passed or the retries are used up.
 *
 * @param target The pending target.
 * @param now Current time (ms).
 */
export const getButtonRetryAction = (target: ButtonScrollTarget, now: number): 'retry' | 'clear' =>
  now > target.until || target.retries >= BUTTON_SCROLL_MAX_RETRIES ? 'clear' : 'retry';

/**
 * The edge the secondary button goes to: opposite the primary button's direction.
 *
 * @param direction The primary button's direction.
 */
export const getSecondaryEdge = (direction: ScrollButtonDirection): ButtonScrollEdge =>
  direction === 'up' ? 'end' : 'top';
