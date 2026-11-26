/**
 * Initial positioning: landing the list on its anchor before the parent reveals it.
 *
 * For an index anchor, FlashList's `initialScrollIndex` lands using estimated heights for unmeasured
 * items, so tall items (forum images) leave the anchor well off its target
 * (Shopify/flash-list#2307). Once FlashList's own initial scroll window has passed, ChatList
 * compares the anchor's measured position with the scroll offset and nudges with a plain
 * `scrollToOffset` (a bounded number of times) until it holds still. `scrollToIndex` is not used: it
 * pauses and re-enables offset correction on its own timers, which raced the initial scroll and
 * overshot.
 *
 * For an end anchor, `startRenderingFromBottom` lands on the top of the last item, which is not the
 * end when that item is taller than the viewport (a gallery). The same nudges take it there.
 *
 * The check is bounded by a watchdog (`READY_WATCHDOG_FRAMES` and `READY_WATCHDOG_MS`), so the
 * parent's overlay can never stick.
 */

import {
  ANCHOR_CORRECTION_START_FRAME,
  ANCHOR_MAX_CORRECTIONS,
  ANCHOR_SCROLL_EVENT_MAX_FRAMES,
  ANCHOR_SETTLED_FRAMES,
  ANCHOR_TOLERANCE,
  READY_WATCHDOG_FRAMES,
  READY_WATCHDOG_MS,
} from '#src/Libraries/ChatList/Constants';

/** How far the scroll offset is from the anchor's target offset, and that target. */
export interface AnchorError {
  /** Current offset minus target; positive when the list is scrolled past the target. */
  error: number;
  target: number;
}

/**
 * The furthest the list can scroll: the content (child container plus header) less the window.
 *
 * @param childContainerHeight FlashList `getChildContainerDimensions().height`.
 * @param firstItemOffset FlashList `getFirstItemOffset()` (the header height).
 * @param windowHeight FlashList `getWindowSize().height`.
 */
export const computeEndOffset = (childContainerHeight: number, firstItemOffset: number, windowHeight: number) =>
  Math.max(childContainerHeight + firstItemOffset - windowHeight, 0);

/**
 * How far the scroll offset is from the anchor's target. An index anchor's top sits `margin` below
 * the top edge, clamped to the furthest the list can scroll; an end anchor (no `itemY`) is at that
 * furthest offset.
 *
 * @param params.offset Current scroll offset.
 * @param params.endOffset Furthest scroll offset (see `computeEndOffset`).
 * @param params.itemY Anchored item's `getLayout(index).y`, relative to the child container. Omit for an end anchor.
 * @param params.firstItemOffset Header height, added to `itemY` to compare it with scroll offsets.
 * @param params.margin Gap left above an index anchor.
 */
export const computeAnchorError = ({
  offset,
  endOffset,
  itemY,
  firstItemOffset,
  margin,
}: {
  offset: number;
  endOffset: number;
  itemY?: number;
  firstItemOffset: number;
  margin: number;
}): AnchorError => {
  const target = itemY === undefined ? endOffset : Math.min(itemY + firstItemOffset - margin, endOffset);
  return {error: offset - target, target};
};

/**
 * Current index of the anchored item. The anchor is tracked by key, not position: an older page can
 * be prepended (FlashList fires onStartReached at mount when the anchor is near the top) before
 * positioning finishes, which shifts every index. Falls back to the mount-time index if the key is gone.
 *
 * @param data Items currently in the list.
 * @param keyExtractor The list's key extractor.
 * @param anchorKey Key of the anchored item, captured at mount.
 * @param fallback Mount-time anchor index.
 */
export const resolveAnchorIndex = <TItem>(
  data: TItem[],
  keyExtractor: (item: TItem) => string,
  anchorKey: string | undefined,
  fallback: number,
): number => {
  if (anchorKey === undefined) {
    return fallback;
  }
  const index = data.findIndex(item => keyExtractor(item) === anchorKey);
  return index >= 0 ? index : fallback;
};

/** Progress of the per-frame ready check. */
export interface ReadyCheckState {
  /** Frames ticked so far. */
  frames: number;
  /** Corrective scrolls issued. */
  corrections: number;
  /** Consecutive in-tolerance measurements. */
  settledFrames: number;
  /** First frame at which the anchor is measured. */
  nextMeasureFrame: number;
  /**
   * While a correction is in flight: the scroll event count when it was issued. The anchor is measured
   * again once a later scroll event arrives, or at `scrollWaitUntilFrame`.
   */
  scrollEventsAtCorrection?: number;
  /** Last frame of the wait for a correction's scroll event (see `ANCHOR_SCROLL_EVENT_MAX_FRAMES`). */
  scrollWaitUntilFrame?: number;
  /** Error measured just before the last correction. */
  lastError?: number;
}

export const initialReadyCheckState: ReadyCheckState = {
  frames: 0,
  corrections: 0,
  settledFrames: 0,
  nextMeasureFrame: ANCHOR_CORRECTION_START_FRAME,
};

/** What one tick of the ready check decided. */
export interface ReadyCheckStep {
  state: ReadyCheckState;
  /** Reveal the list now. */
  ready: boolean;
  /** The reveal is the watchdog's, not a settled anchor. Worth a warning. */
  watchdog: boolean;
  /** Issue a non-animated `scrollToOffset` to this offset. */
  scrollTo?: number;
}

/**
 * One frame of the ready check. `measure` is only called from `ANCHOR_CORRECTION_START_FRAME` on, and
 * after a correction only once a scroll event newer than it has arrived (bounded by
 * `ANCHOR_SCROLL_EVENT_MAX_FRAMES`). It returns undefined while layout is unavailable.
 *
 * The anchor is positioned after `ANCHOR_SETTLED_FRAMES` consecutive in-tolerance measurements. When
 * a correction did not change the measured error, the list cannot get any closer (the end of the
 * content, or a measurement that does not track this scroll), so waiting for the fallback would only
 * delay the reveal. Otherwise the watchdog reveals the list once the check has run for both
 * `READY_WATCHDOG_FRAMES` frames and `READY_WATCHDOG_MS` (see Constants.ts for why both).
 *
 * @param state Progress so far (start from `initialReadyCheckState`).
 * @param measure Measures the anchor's current error.
 * @param elapsedMs Time since the check's first frame.
 * @param scrollEvents Scroll events the list has received so far (any running count).
 */
export const stepReadyCheck = (
  state: ReadyCheckState,
  measure: () => AnchorError | undefined,
  elapsedMs: number,
  scrollEvents: number,
): ReadyCheckStep => {
  const frames = state.frames + 1;
  let next: ReadyCheckState = {...state, frames};
  let positioned = false;
  let scrollTo: number | undefined;
  const awaitingScroll =
    state.scrollEventsAtCorrection !== undefined &&
    scrollEvents <= state.scrollEventsAtCorrection &&
    frames < (state.scrollWaitUntilFrame ?? 0);
  if (frames >= state.nextMeasureFrame && !awaitingScroll) {
    next = {...next, scrollEventsAtCorrection: undefined, scrollWaitUntilFrame: undefined};
    const anchorError = measure();
    if (!anchorError) {
      positioned = false;
    } else if (Math.abs(anchorError.error) <= ANCHOR_TOLERANCE) {
      next = {...next, settledFrames: state.settledFrames + 1};
      positioned = next.settledFrames >= ANCHOR_SETTLED_FRAMES;
    } else if (state.lastError !== undefined && Math.abs(anchorError.error - state.lastError) <= ANCHOR_TOLERANCE) {
      positioned = true;
    } else {
      next = {...next, settledFrames: 0};
      if (state.corrections < ANCHOR_MAX_CORRECTIONS) {
        next = {
          ...next,
          corrections: state.corrections + 1,
          lastError: anchorError.error,
          scrollEventsAtCorrection: scrollEvents,
          scrollWaitUntilFrame: frames + ANCHOR_SCROLL_EVENT_MAX_FRAMES,
        };
        scrollTo = anchorError.target;
      }
    }
  }
  const watchdog = !positioned && frames >= READY_WATCHDOG_FRAMES && elapsedMs >= READY_WATCHDOG_MS;
  return {state: next, ready: positioned || watchdog, watchdog, scrollTo};
};
