import {useEffect, useRef} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';
import {PAGE_FILL_DELAY_MS} from '#src/Libraries/ChatList/Constants';
import {getPageFillAction, nextPageFillDelay} from '#src/Libraries/ChatList/Pagination';

interface UseChatListPageFillProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  arbiter: ChatListScrollArbiter;
  /** Whether the list has been revealed; the fill waits for it. */
  ready: boolean;
  dataLength: number;
  anchorsToEnd: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleLoadPrevious?: () => void;
  handleLoadNext?: () => void;
  applyAtTop: (offset: number) => void;
  applyScrollButtonDirection: () => void;
}

/**
 * Loads pages into ChatList when scroll events cannot: a list too short to scroll gets none, so
 * FlashList's onStartReached/onEndReached never fire. Checks once the list is ready and after each
 * page. While a check still finds a page to load (or cannot measure yet) it re-checks with a doubling
 * delay, in case the load fails or a refetch cancels it. Once a check finds nothing to load it stops:
 * the list is away from both edges, so scroll events and FlashList's reached callbacks take over, and
 * the next page that lands starts a new round. Why it reads
 * FlashList's tracked offset and not the last scroll event is in `src/Libraries/ChatList/Pagination.ts`.
 *
 * The handlers are read from refs: they change identity around every fetch, and restarting the check
 * on that would retry a failing load with no delay. The pagination hook ignores calls while a fetch is
 * in flight.
 */
export const useChatListPageFill = <TItem>({
  listRef,
  arbiter,
  ready,
  dataLength,
  anchorsToEnd,
  hasPreviousPage,
  hasNextPage,
  handleLoadPrevious,
  handleLoadNext,
  applyAtTop,
  applyScrollButtonDirection,
}: UseChatListPageFillProps<TItem>) => {
  const handleLoadNextRef = useRef(handleLoadNext);
  const handleLoadPreviousRef = useRef(handleLoadPrevious);

  useEffect(() => {
    handleLoadNextRef.current = handleLoadNext;
    handleLoadPreviousRef.current = handleLoadPrevious;
  });

  // FlashList swallows the scroll event of its own correction after a prepend, so the state derived
  // from the last scroll event is stale too; the first check after a page refreshes it.
  useEffect(() => {
    if (!ready) {
      return;
    }
    let delay = PAGE_FILL_DELAY_MS;
    let isFirstCheck = true;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      // Unmeasured counts as "still something to do", so a check that runs before layout retries.
      let wantsPage = true;
      const list = listRef.current;
      const endOffset = arbiter.getEndOffset();
      if (list && endOffset !== undefined) {
        const viewportHeight = list.getWindowSize().height;
        const offset = Math.min(list.getAbsoluteLastScrollOffset(), endOffset);
        if (isFirstCheck && arbiter.scrollMetrics.current) {
          arbiter.scrollMetrics.current = {...arbiter.scrollMetrics.current, offset};
          applyAtTop(offset);
          applyScrollButtonDirection();
        }
        const action = getPageFillAction({
          offset,
          endOffset,
          viewportHeight,
          hasPreviousPage,
          hasNextPage,
          anchorsToEnd,
        });
        wantsPage = action.load !== null;
        if (action.load === 'previous') {
          arbiter.dispatch({type: 'loadPrevious', pinEndOnFill: action.pinEndOnFill});
          handleLoadPreviousRef.current?.();
        } else if (action.load === 'next') {
          handleLoadNextRef.current?.();
        }
      }
      isFirstCheck = false;
      if (wantsPage && (hasPreviousPage || hasNextPage)) {
        delay = nextPageFillDelay(delay);
        timer = setTimeout(check, delay);
      }
    };
    timer = setTimeout(check, delay);
    return () => clearTimeout(timer);
  }, [
    anchorsToEnd,
    applyAtTop,
    applyScrollButtonDirection,
    dataLength,
    hasNextPage,
    hasPreviousPage,
    listRef,
    ready,
    arbiter,
  ]);
};
