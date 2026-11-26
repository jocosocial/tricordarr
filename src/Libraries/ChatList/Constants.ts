/**
 * Tuning constants for `ChatList` (`src/Components/Lists/ChatList.tsx`). Most of these were tuned
 * on real devices (Android emulator, Pixel, iOS simulator); change them only with a device pass.
 */

/**
 * Whether a chat anchored to the end lets FlashList start from the bottom
 * (`maintainVisibleContentPosition.startRenderingFromBottom`). This is the single switch for the
 * first fallback in `docs/Specifications/Bi-Directional Chat List.md`: set it to false if
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

/** Frames the ready check waits before revealing the list regardless of position (~750ms at 60fps). */
export const READY_MAX_FRAMES = 45;

/** Pixels of slack when deciding the viewport is at the bottom (the footer is not in the measured content). */
export const AT_BOTTOM_EPSILON = 50;

/**
 * After a scroll-to-bottom button press, how long the list keeps re-pinning the end when content
 * below it grows (an image measuring in, the next page arriving). Bounded; a user drag ends it early.
 */
export const END_PIN_MS = 2000;

/**
 * After a scroll button press, how long a scroll that ended short of its edge is sent again. Bounded,
 * so a stale target cannot move the list long after the press; a touch on the list ends it early.
 */
export const BUTTON_SCROLL_WINDOW_MS = 2000;

/** Upper bound on repeated scrolls for one scroll button press. */
export const BUTTON_SCROLL_MAX_RETRIES = 3;

/** Momentum beginning within this long of a drag ending is the user's fling, not a programmatic scroll. */
export const FLING_AFTER_DRAG_MS = 100;

/** Frames after onLoad before correcting an index anchor; FlashList's initial scroll settles within ~100ms. */
export const ANCHOR_CORRECTION_START_FRAME = 9;

/** Frames to wait after a corrective scroll before measuring again, so the scroll event has landed. */
export const ANCHOR_CORRECTION_WAIT_FRAMES = 3;

/** Pixels an index anchor may be off its target and still count as positioned. */
export const ANCHOR_TOLERANCE = 8;

/** Consecutive in-tolerance frames before an index anchor counts as settled. */
export const ANCHOR_SETTLED_FRAMES = 2;

/** Upper bound on corrective scrolls for an index anchor, so measuring images cannot loop it. */
export const ANCHOR_MAX_CORRECTIONS = 4;

/** Fraction of the viewport the New divider is placed below the top edge when scrolling to it. */
export const DIVIDER_VIEW_POSITION = 0.1;
