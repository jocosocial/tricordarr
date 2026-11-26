/**
 * Loading older and newer pages, and telling a prepend apart from an append.
 *
 * FlashList's onStartReached stops firing after a few prepends that add less than a threshold of
 * content (Shopify/flash-list#1785), so ChatList also loads older posts directly from onScroll when
 * near the top (the nudge).
 *
 * onStartReached/onEndReached and the nudge all depend on scroll events. A list too short to scroll
 * never gets one, and startRenderingFromBottom leaves FlashList's tracked offset at the last item,
 * which can be outside its start threshold, so a short first page sat on "Loading previous..."
 * forever. The page fill checks the position once the list is ready and after each page, re-checking
 * with a doubling delay because a load can also fail or be cancelled by a refetch.
 *
 * The page fill goes by FlashList's tracked offset, not the last scroll event. FlashList swallows the
 * scroll event of its own correction after a prepend, so the last event still says the list is at the
 * top, and going by it loaded every older page in a row.
 *
 * An end-anchored list that does not fill the viewport yet is bottom-aligned by a FlashList margin
 * that goes away as it fills, which FlashList's position correction does not count, so when the
 * page fill loads an older page into one, the end is pinned once the content outgrows the viewport
 * (see `Pinning.ts`).
 */

import {
  LOAD_NEXT_FILL_FRACTION,
  LOAD_PREVIOUS_NUDGE_FRACTION,
  PAGE_FILL_MAX_DELAY_MS,
} from '#src/Libraries/ChatList/Constants';

/** Keys of the first and last items, used to tell a prepend from an end append. */
export interface EdgeKeys {
  first?: string;
  last?: string;
}

/**
 * Keys of the first and last items of `data`.
 *
 * @param data Items in the list.
 * @param keyExtractor The list's key extractor.
 */
export const getEdgeKeys = <TItem>(data: TItem[], keyExtractor: (item: TItem) => string): EdgeKeys => ({
  first: data.length > 0 ? keyExtractor(data[0]) : undefined,
  last: data.length > 0 ? keyExtractor(data[data.length - 1]) : undefined,
});

/**
 * Whether the data grew at the end (a new post), as opposed to a prepend (loading older posts,
 * #610) or no change. A prepend changes the first key; an end append changes the last key and
 * leaves the first. The first data after an empty list counts as an end append.
 *
 * @param prev Edge keys before the change.
 * @param next Edge keys after the change.
 */
export const isEndAppend = (prev: EdgeKeys, next: EdgeKeys) => {
  const wasEmpty = prev.last === undefined;
  return next.last !== undefined && next.last !== prev.last && (next.first === prev.first || wasEmpty);
};

/**
 * Whether a scroll event should load the previous page directly (the nudge for
 * Shopify/flash-list#1785). Not before the initial position has settled, when the offset is
 * transiently 0. The pagination hook ignores calls while a fetch is in flight.
 *
 * @param params.ready Whether the list has been revealed.
 * @param params.hasPreviousPage Whether an older page can be loaded.
 * @param params.offset Scroll offset from the event.
 * @param params.viewportHeight Viewport height from the event.
 */
export const shouldNudgeLoadPrevious = ({
  ready,
  hasPreviousPage,
  offset,
  viewportHeight,
}: {
  ready: boolean;
  hasPreviousPage: boolean | undefined;
  offset: number;
  viewportHeight: number;
}) => ready && !!hasPreviousPage && offset < viewportHeight * LOAD_PREVIOUS_NUDGE_FRACTION;

/** What one page fill check decided. */
export interface PageFillAction {
  load: 'previous' | 'next' | null;
  /** Pin the end once the content outgrows the viewport. Only meaningful with `load: 'previous'`. */
  pinEndOnFill: boolean;
}

/**
 * One page fill check. Loads the previous page when near the top, else the next page when near the
 * bottom. Previous wins when both apply (a list shorter than the viewport).
 *
 * @param params.offset FlashList's tracked offset, clamped to `endOffset`.
 * @param params.endOffset Furthest scroll offset.
 * @param params.viewportHeight FlashList's window height.
 * @param params.hasPreviousPage Whether an older page can be loaded.
 * @param params.hasNextPage Whether a newer page can be loaded.
 * @param params.anchorsToEnd Whether the list is anchored to the end.
 */
export const getPageFillAction = ({
  offset,
  endOffset,
  viewportHeight,
  hasPreviousPage,
  hasNextPage,
  anchorsToEnd,
}: {
  offset: number;
  endOffset: number;
  viewportHeight: number;
  hasPreviousPage: boolean | undefined;
  hasNextPage: boolean | undefined;
  anchorsToEnd: boolean;
}): PageFillAction => {
  if (hasPreviousPage && offset < viewportHeight * LOAD_PREVIOUS_NUDGE_FRACTION) {
    return {load: 'previous', pinEndOnFill: anchorsToEnd && endOffset === 0};
  }
  if (hasNextPage && endOffset - offset < viewportHeight * LOAD_NEXT_FILL_FRACTION) {
    return {load: 'next', pinEndOnFill: false};
  }
  return {load: null, pinEndOnFill: false};
};

/**
 * Delay before the next page fill check: doubled, capped at `PAGE_FILL_MAX_DELAY_MS`.
 *
 * @param delay The delay just used.
 */
export const nextPageFillDelay = (delay: number) => Math.min(delay * 2, PAGE_FILL_MAX_DELAY_MS);
