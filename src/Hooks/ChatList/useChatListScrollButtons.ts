import {useCallback, useEffect, useRef, useState} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import type {ChatListScrollArbiter} from '#src/Hooks/ChatList/useChatListScrollArbiter';
import {DIVIDER_VIEW_POSITION} from '#src/Libraries/ChatList/Constants';
import {
  getScrollButtonDirection,
  getSecondaryEdge,
  isAtTop,
  ScrollButtonDirection,
} from '#src/Libraries/ChatList/ScrollButtons';

interface UseChatListScrollButtonsProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  arbiter: ChatListScrollArbiter;
  newDividerIndex?: number;
  hasPreviousPage?: boolean;
}

/**
 * State and handlers for ChatList's floating scroll buttons: which way they point, whether
 * scroll-to-top is greyed out, and pressing them. Presses go to the scroll arbiter, which keeps
 * sending the list to its edge until it lands, because on Android an animated scroll is cancelled by
 * FlashList's own offset corrections. The decisions and the reasons for them are in
 * `src/Libraries/ChatList/ScrollButtons.ts` and `ScrollArbiter.ts`.
 *
 * The scroll handlers call `applyScrollButtonDirection` and `applyAtTop` as the list moves.
 */
export const useChatListScrollButtons = <TItem>({
  listRef,
  arbiter,
  newDividerIndex,
  hasPreviousPage,
}: UseChatListScrollButtonsProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const [scrollButtonDirection, setScrollButtonDirection] = useState<ScrollButtonDirection>(null);
  const scrollButtonDirectionRef = useRef<ScrollButtonDirection>(null);
  // At the top edge, where the scroll-to-top button has nothing to do and is greyed out. Never set
  // while an older page exists: the top is only a waypoint then, and greying the button for the
  // moment the page takes to load just made it flicker off and on.
  const [atTop, setAtTop] = useState(false);
  const atTopRef = useRef(false);

  /**
   * Derives which floating scroll button to show from the latest scroll metrics (see
   * `getScrollButtonDirection`).
   *
   * `getLayout(index).y` is relative to the list's child container, which starts below the header,
   * so the header height (`getFirstItemOffset`) is added to compare against scroll offsets.
   */
  const computeScrollButtonDirection = useCallback((): ScrollButtonDirection => {
    const metrics = arbiter.scrollMetrics.current;
    if (!metrics) {
      return null;
    }
    const list = listRef.current;
    const layout = newDividerIndex !== undefined ? list?.getLayout(newDividerIndex) : undefined;
    const dividerTop = list && layout ? layout.y + list.getFirstItemOffset() : undefined;
    return getScrollButtonDirection(
      metrics,
      styleDefaults.listScrollThreshold,
      layout && dividerTop !== undefined ? {top: dividerTop, bottom: dividerTop + layout.height} : undefined,
    );
  }, [arbiter, listRef, newDividerIndex, styleDefaults.listScrollThreshold]);

  /** Recomputes the button direction, touching state only when it actually changed. */
  const applyScrollButtonDirection = useCallback(() => {
    const direction = computeScrollButtonDirection();
    if (direction !== scrollButtonDirectionRef.current) {
      scrollButtonDirectionRef.current = direction;
      setScrollButtonDirection(direction);
    }
  }, [computeScrollButtonDirection]);

  // The divider moving (a post clears it, a page shifts its index) changes the answer without a scroll.
  useEffect(() => {
    applyScrollButtonDirection();
  }, [applyScrollButtonDirection]);

  /**
   * Tracks whether the list is at the real beginning of the conversation (no older page to load),
   * touching state only when it actually changed.
   */
  const applyAtTop = useCallback(
    (offset: number) => {
      const nowAtTop = isAtTop(offset, hasPreviousPage, styleDefaults.marginSize);
      if (nowAtTop !== atTopRef.current) {
        atTopRef.current = nowAtTop;
        setAtTop(nowAtTop);
      }
    },
    [hasPreviousPage, styleDefaults.marginSize],
  );

  /**
   * Primary button: to the "New" divider when there is one, else to the end of the list. Pressing
   * toward an edge keeps the list going there until it lands (see the arbiter's `buttonTarget`).
   */
  const onPrimaryPress = useCallback(() => {
    if (newDividerIndex !== undefined) {
      arbiter.dispatch({type: 'dividerPress', index: newDividerIndex, viewPosition: DIVIDER_VIEW_POSITION});
    } else {
      arbiter.dispatch({type: 'buttonPress', edge: 'end', now: Date.now()});
    }
  }, [arbiter, newDividerIndex]);

  /** Secondary button: to the list edge opposite the primary button's direction. */
  const onSecondaryPress = useCallback(() => {
    arbiter.dispatch({type: 'buttonPress', edge: getSecondaryEdge(scrollButtonDirection), now: Date.now()});
  }, [arbiter, scrollButtonDirection]);

  /**
   * Any touch on the list hands it back to the user. Touching it stops an animated scroll on Android,
   * and the momentum end must not take that for a cancelled button scroll and send it again.
   */
  const onListTouchStart = useCallback(() => {
    arbiter.dispatch({type: 'touchStart'});
  }, [arbiter]);

  return {
    scrollButtonDirection,
    atTop,
    applyScrollButtonDirection,
    applyAtTop,
    onPrimaryPress,
    onSecondaryPress,
    onListTouchStart,
  };
};
