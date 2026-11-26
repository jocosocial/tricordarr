import {useEffect, useRef} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {getEdgeKeys, isEndAppend} from '#src/Libraries/ChatList/Pagination';

interface UseChatListOwnItemScrollProps<TItem> {
  listRef: TChatListRefObject<TItem>;
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
 */
export const useChatListOwnItemScroll = <TItem>({
  listRef,
  data,
  keyExtractor,
  isOwnItem,
}: UseChatListOwnItemScrollProps<TItem>) => {
  const ownScrollFrameRef = useRef<number | null>(null);
  const prevKeysRef = useRef(getEdgeKeys(data, keyExtractor));

  useEffect(() => {
    return () => {
      if (ownScrollFrameRef.current !== null) {
        cancelAnimationFrame(ownScrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const keys = getEdgeKeys(data, keyExtractor);
    const prev = prevKeysRef.current;
    prevKeysRef.current = keys;
    if (!isEndAppend(prev, keys) || !isOwnItem?.(data[data.length - 1])) {
      return;
    }
    if (ownScrollFrameRef.current !== null) {
      cancelAnimationFrame(ownScrollFrameRef.current);
    }
    ownScrollFrameRef.current = requestAnimationFrame(() => {
      ownScrollFrameRef.current = null;
      listRef.current?.scrollToEnd({animated: true});
    });
  }, [data, keyExtractor, isOwnItem, listRef]);
};
