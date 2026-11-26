import {useCallback, useEffect, useRef, useState} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import type {ChatListSharedState} from '#src/Hooks/ChatList/useChatListSharedState';
import {DIVIDER_VIEW_POSITION, END_PIN_MS} from '#src/Libraries/ChatList/Constants';
import {
  ButtonScrollEdge,
  ButtonScrollTarget,
  createButtonScrollTarget,
  getButtonRetryAction,
  getScrollButtonDirection,
  getSecondaryEdge,
  hasReachedButtonEdge,
  isAtTop,
  ScrollButtonDirection,
} from '#src/Libraries/ChatList/ScrollButtons';

interface UseChatListScrollButtonsProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  shared: ChatListSharedState;
  newDividerIndex?: number;
  hasPreviousPage?: boolean;
}

/**
 * State and handlers for ChatList's floating scroll buttons: which way they point, whether
 * scroll-to-top is greyed out, and pressing them. A press keeps sending the list to its edge until it
 * lands, because on Android an animated scroll is cancelled by FlashList's own offset corrections.
 * The decisions and the reasons for them are in `src/Libraries/ChatList/ScrollButtons.ts`.
 *
 * The scroll handlers call `applyScrollButtonDirection`, `applyAtTop`, `clearButtonTargetIfReached`
 * and `retryButtonScroll` as the list moves.
 */
export const useChatListScrollButtons = <TItem>({
  listRef,
  shared,
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
  // The edge a scroll button sent the list to, until the list reaches it. Cleared by a touch on the list.
  const buttonTargetRef = useRef<ButtonScrollTarget | null>(null);

  /**
   * Derives which floating scroll button to show from the latest scroll metrics (see
   * `getScrollButtonDirection`).
   *
   * `getLayout(index).y` is relative to the list's child container, which starts below the header,
   * so the header height (`getFirstItemOffset`) is added to compare against scroll offsets.
   */
  const computeScrollButtonDirection = useCallback((): ScrollButtonDirection => {
    const metrics = shared.scrollMetrics.current;
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
  }, [listRef, newDividerIndex, shared, styleDefaults.listScrollThreshold]);

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
   * Scrolls to the end for a button press and keeps the end pinned for END_PIN_MS, so a tall last
   * post whose image measures in after landing (or a page that arrives) doesn't leave the list short
   * of the bottom with the buttons already hidden.
   */
  const scrollToEndFromButton = useCallback(() => {
    shared.endPinUntil.current = Date.now() + END_PIN_MS;
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef, shared]);

  /** Animates to a list edge for a button press. */
  const scrollToButtonEdge = useCallback(
    (edge: ButtonScrollEdge) => {
      if (edge === 'end') {
        scrollToEndFromButton();
      } else {
        listRef.current?.scrollToOffset({offset: 0, animated: true});
      }
    },
    [listRef, scrollToEndFromButton],
  );

  /** Scrolls to a list edge for a button press and keeps sending it there until it lands (see buttonTargetRef). */
  const startButtonScroll = useCallback(
    (edge: ButtonScrollEdge) => {
      buttonTargetRef.current = createButtonScrollTarget(edge, Date.now());
      scrollToButtonEdge(edge);
    },
    [scrollToButtonEdge],
  );

  /** Primary button: to the "New" divider when there is one, else to the end of the list. */
  const onPrimaryPress = useCallback(() => {
    if (newDividerIndex !== undefined) {
      listRef.current?.scrollToIndex({index: newDividerIndex, animated: true, viewPosition: DIVIDER_VIEW_POSITION});
    } else {
      startButtonScroll('end');
    }
  }, [listRef, newDividerIndex, startButtonScroll]);

  /** Secondary button: to the list edge opposite the primary button's direction. */
  const onSecondaryPress = useCallback(() => {
    startButtonScroll(getSecondaryEdge(scrollButtonDirection));
  }, [scrollButtonDirection, startButtonScroll]);

  /** Clears the button target once a scroll event shows the list reached its edge. */
  const clearButtonTargetIfReached = useCallback(
    (offset: number, distanceFromBottom: number) => {
      const buttonTarget = buttonTargetRef.current;
      if (
        buttonTarget &&
        hasReachedButtonEdge(buttonTarget.edge, offset, distanceFromBottom, styleDefaults.marginSize)
      ) {
        buttonTargetRef.current = null;
      }
    },
    [styleDefaults.marginSize],
  );

  /**
   * Any touch on the list hands it back to the user. Touching it stops an animated scroll on Android,
   * and the momentum end must not take that for a cancelled button scroll and send it again.
   */
  const onListTouchStart = useCallback(() => {
    buttonTargetRef.current = null;
  }, []);

  /**
   * Called when momentum ends. A button scroll that ended short of its edge (the target is cleared
   * once it lands) was cancelled on the way, so it is sent again within its window and retry budget.
   */
  const retryButtonScroll = useCallback(() => {
    const buttonTarget = buttonTargetRef.current;
    if (!buttonTarget) {
      return;
    }
    if (getButtonRetryAction(buttonTarget, Date.now()) === 'clear') {
      buttonTargetRef.current = null;
    } else {
      buttonTarget.retries += 1;
      scrollToButtonEdge(buttonTarget.edge);
    }
  }, [scrollToButtonEdge]);

  return {
    scrollButtonDirection,
    atTop,
    applyScrollButtonDirection,
    applyAtTop,
    onPrimaryPress,
    onSecondaryPress,
    clearButtonTargetIfReached,
    onListTouchStart,
    retryButtonScroll,
  };
};
