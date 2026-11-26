import {useEffect, useRef} from 'react';

import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';
import {getEdgeKeys, isEndAppend} from '#src/Libraries/ChatList/Pagination';

interface UseChatListOwnItemScrollProps<TItem> {
  arbiter: ChatListScrollArbiter;
  data: TItem[];
  keyExtractor: (item: TItem) => string;
  isOwnItem?: (item: TItem) => boolean;
}

/**
 * Scrolls ChatList to the user's own post when it lands at the end, wherever the user was.
 *
 * Posts arriving from others are followed by FlashList's autoscrollToBottomThreshold. The user's own
 * posts must always land in view, and only the list sees the data reach it (a parent calling
 * scrollToEnd right after updating the cache fires a render or more too early). End growth is told
 * apart from a prepend (loading older posts, #610) by `isEndAppend` (`src/Libraries/ChatList/Pagination.ts`).
 * The scroll itself runs through the scroll arbiter.
 */
export const useChatListOwnItemScroll = <TItem>({
  arbiter,
  data,
  keyExtractor,
  isOwnItem,
}: UseChatListOwnItemScrollProps<TItem>) => {
  const prevKeysRef = useRef(getEdgeKeys(data, keyExtractor));

  useEffect(() => {
    const keys = getEdgeKeys(data, keyExtractor);
    const prev = prevKeysRef.current;
    prevKeysRef.current = keys;
    if (isEndAppend(prev, keys) && isOwnItem?.(data[data.length - 1])) {
      arbiter.dispatch({type: 'ownItemAppended'});
    }
  }, [arbiter, data, keyExtractor, isOwnItem]);
};
