/**
 * Tuning constants for `ChatList` (`src/Components/Lists/ChatList.tsx`). Most of these were tuned
 * on real devices (Android emulator, Pixel, iOS simulator); change them only with a device pass.
 *
 * Timing is not correctness. A constant here is a spatial threshold, a bound (a retry count or a
 * pixel tolerance), or a watchdog: a backstop in milliseconds that should never fire on a correct
 * path and logs a warning when it does. Do not add a delay or a frame count that something has to
 * wait out; find the event it stands in for and listen to that instead.
 *
 * One deliberate exception: `ANCHOR_CORRECTION_START_FRAME` (see its comment for why it is safe).
 */

/**
 * Whether a chat anchored to the end lets FlashList start from the bottom
 * (`maintainVisibleContentPosition.startRenderingFromBottom`). This is the single switch for the
 * first fallback in `docs/ChatList/README.md`: set it to false if
 * `startRenderingFromBottom` misbehaves on a device (short chats, Android flicker). The list then
 * opens via `initialScrollIndex = last item` instead, which leaves chats shorter than the viewport
 * top-aligned.
 */
export const START_RENDERING_FROM_BOTTOM = true;

/** Fraction of the viewport from the bottom within which FlashList keeps following new content. */
export const AUTOSCROLL_TO_BOTTOM_THRESHOLD = 0.2;

/** Fraction of the viewport from the top below which the load-previous nudge fires. */
export const LOAD_PREVIOUS_NUDGE_FRACTION = 0.2;

/** Fraction of the viewport from the bottom below which the page fill loads the next page. */
export const LOAD_NEXT_FILL_FRACTION = 0.5;

/** Delay before the page fill check, long enough for FlashList to settle the position after a prepend. */
export const PAGE_FILL_DELAY_MS = 500;

/** Upper bound on the doubling delay between page fill checks while a page fails to load. */
export const PAGE_FILL_MAX_DELAY_MS = 30000;

/**
 * Watchdog for the ready check: it reveals the list regardless of position once it has run for at
 * least `READY_WATCHDOG_FRAMES` frames AND `READY_WATCHDOG_MS` since its first frame, so the parent's
 * overlay can never stick. Logs a warning when it fires. A normal open settles in about ten frames.
 *
 * Both floors are needed. Frames alone shrink on a fast display (45 frames is 375ms at 120Hz).
 * Wall-clock time alone runs out while the JS thread is busy: opening an image-heavy forum thread
 * in a debug build stalled frames for seconds, and a 750ms (or 2s) timer revealed the list after two
 * frames, before the check had measured anything.
 */
export const READY_WATCHDOG_FRAMES = 45;

/** See `READY_WATCHDOG_FRAMES`. */
export const READY_WATCHDOG_MS = 750;

/** Pixels of slack when deciding the viewport is at the bottom (the footer is not in the measured content). */
export const AT_BOTTOM_EPSILON = 50;

/**
 * After a scroll-to-bottom button press, how long the list keeps re-pinning the end when content
 * below it grows (an image measuring in, the next page arriving). Bounded; a user drag ends it early.
 */
export const END_PIN_MS = 2000;

/**
 * Upper bound on repeated scrolls for one scroll button press. A touch on the list, or reaching the
 * edge, ends the retries sooner.
 */
export const BUTTON_SCROLL_MAX_RETRIES = 3;

/**
 * Frames after onLoad before the ready check first measures the anchor. A deliberate exception to the
 * no-frame-count rule above: it saves measuring while layout is still estimated, and correctness does
 * not depend on it.
 *
 * FlashList re-applies `initialScrollIndex` on every commit for 100ms after first layout
 * (`applyInitialScrollIndex` in `useRecyclerViewController.tsx`), which FlashList exposes no event
 * for. On a 120Hz display nine frames is 75ms, so the first correction can land inside that window.
 * That is harmless: FlashList scrolls to `layout.y + viewOffset + firstItemOffset`, the same target
 * `computeAnchorError` corrects to, so both scrolls go to one place. At worst it spends one of
 * `ANCHOR_MAX_CORRECTIONS`. The overshoot this window once caused came from `scrollToIndex`'s own
 * timers, which the check no longer uses.
 */
export const ANCHOR_CORRECTION_START_FRAME = 9;

/**
 * Bound on frames the ready check waits for the scroll event of its own correction before measuring
 * anyway. Measuring before that event reads the pre-correction offset, which looks like a correction
 * that changed nothing and reveals the list early. A correction that moves the list always fires a
 * scroll event; one that cannot (the measurement does not track the scroll) never does, so this only
 * bounds that case. Not a delay: the check measures on the first frame after the event.
 */
export const ANCHOR_SCROLL_EVENT_MAX_FRAMES = 20;

/** Pixels an index anchor may be off its target and still count as positioned. */
export const ANCHOR_TOLERANCE = 8;

/** Consecutive in-tolerance frames before an index anchor counts as settled. */
export const ANCHOR_SETTLED_FRAMES = 2;

/** Upper bound on corrective scrolls for an index anchor, so measuring images cannot loop it. */
export const ANCHOR_MAX_CORRECTIONS = 4;

/** Fraction of the viewport the New divider is placed below the top edge when scrolling to it. */
export const DIVIDER_VIEW_POSITION = 0.1;
