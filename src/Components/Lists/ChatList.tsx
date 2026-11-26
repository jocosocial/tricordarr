import {FlashList, type FlashListRef, type ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import {FloatingScrollButtonsView} from '#src/Components/Buttons/FloatingScrollButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {
  computeAnchorError,
  computeEndOffset,
  initialReadyCheckState,
  ReadyCheckState,
  resolveAnchorIndex as resolveAnchorIndexIn,
  stepReadyCheck,
} from '#src/Libraries/ChatList/Anchor';
import {
  AUTOSCROLL_TO_BOTTOM_THRESHOLD,
  DIVIDER_VIEW_POSITION,
  END_PIN_MS,
  KEYBOARD_SETTLE_DELAYS_MS,
  PAGE_FILL_DELAY_MS,
  START_RENDERING_FROM_BOTTOM,
} from '#src/Libraries/ChatList/Constants';
import {getFallbackEndIndex, getInitialScrollIndex} from '#src/Libraries/ChatList/InitialScroll';
import {
  getEdgeKeys,
  getPageFillAction,
  isEndAppend,
  nextPageFillDelay,
  shouldNudgeLoadPrevious,
} from '#src/Libraries/ChatList/Pagination';
import {
  hasOutgrownViewport,
  isUserFling,
  shouldPinAfterKeyboard,
  shouldRepinOnContentGrowth,
  shouldRepinOnResize,
} from '#src/Libraries/ChatList/Pinning';
import {
  ButtonScrollEdge,
  ButtonScrollTarget,
  createButtonScrollTarget,
  getButtonRetryAction,
  getDistanceFromBottom,
  getScrollButtonDirection,
  getSecondaryEdge,
  hasReachedButtonEdge,
  isAtTop,
  ScrollButtonDirection,
  ScrollMetrics,
} from '#src/Libraries/ChatList/ScrollButtons';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('ChatList.tsx');

export type TChatListRef<TItem> = FlashListRef<TItem> | null;
export type TChatListRefObject<TItem> = React.RefObject<TChatListRef<TItem>>;

interface ChatListProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  data: TItem[];
  renderItem: ListRenderItem<TItem>;
  /** Required: FlashList's maintain-visible-content-position is a silent no-op without it. */
  keyExtractor: (item: TItem) => string;
  getItemType?: (item: TItem, index: number, extraData?: unknown) => string | number | undefined;
  /**
   * Forwarded to FlashList. Recycled cells only re-invoke `renderItem` when `item`/`index` change or
   * `extraData` changes identity, so state derived outside `data` (e.g. the "New" divider position)
   * must be reflected here or recycled cells keep stale content.
   */
  extraData?: unknown;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /**
   * Padding goes here rather than on the list's own style, so the scroll indicator stays on the
   * screen edge instead of inside the padding. Horizontal padding only: vertical padding shifts
   * FlashList's first item offset.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Pixels rendered beyond the viewport. Raise for image-heavy lists. */
  drawDistance?: number;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  /**
   * Where the list opens. 'end' opens at the newest item; `{index}` opens with that item (e.g. the
   * first unread) just below the top edge.
   */
  anchor: 'end' | {index: number};
  /**
   * Keep following new items appended at the end while the user is near the bottom. Defaults to
   * `anchor === 'end'`.
   */
  followTail?: boolean;
  /**
   * Identifies items authored by the current user. When an item like that lands at the end of the
   * list the list always scrolls to it, even if the user was not near the bottom.
   */
  isOwnItem?: (item: TItem) => boolean;
  /**
   * Fired once the list is at its initial position. The parent should hide any overlay once this
   * fires. Always fires eventually, including for empty lists.
   */
  onReadyToShow?: () => void;
  /**
   * Index of the "New" divider in `data`. When set, the floating scroll button navigates to the
   * divider instead of the end of the list and points up or down toward it.
   */
  newDividerIndex?: number;
  enableScrollButton?: boolean;
}

/**
 * Chat-style list on FlashList v2 with data ordered oldest to newest. Handles opening at the
 * bottom or at an index, loading older and newer pages without moving the viewport, following new
 * posts, scrolling to the user's own posts, and the floating scroll buttons.
 *
 * Not used directly by screens; domain wrappers (`FezConversationListV2`, `ForumConversationListV2`)
 * supply `renderItem`, dividers, and the anchor. Parent screens hold `readyToShow` state, render an
 * opaque overlay until `onReadyToShow` fires, and remount the list via `key` when the anchor index
 * becomes known (see `FezChatScreen`).
 */
export const ChatList = <TItem,>({
  listRef,
  data,
  renderItem,
  keyExtractor,
  getItemType,
  extraData,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  refreshControl,
  contentContainerStyle,
  drawDistance = 500,
  handleLoadNext,
  handleLoadPrevious,
  hasNextPage,
  hasPreviousPage,
  anchor,
  followTail,
  isOwnItem,
  onReadyToShow,
  newDividerIndex,
  enableScrollButton,
}: ChatListProps<TItem>) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
  const anchorsToEnd = anchor === 'end';
  const anchorIndex = anchor === 'end' ? undefined : anchor.index;
  const effectiveFollowTail = followTail ?? anchorsToEnd;

  const [scrollButtonDirection, setScrollButtonDirection] = useState<ScrollButtonDirection>(null);
  const scrollButtonDirectionRef = useRef<ScrollButtonDirection>(null);
  // At the top edge, where the scroll-to-top button has nothing to do and is greyed out. Never set
  // while an older page exists: the top is only a waypoint then, and greying the button for the
  // moment the page takes to load just made it flicker off and on.
  const [atTop, setAtTop] = useState(false);
  const atTopRef = useRef(false);
  const scrollMetricsRef = useRef<ScrollMetrics | null>(null);
  // Whether the user is within a threshold of the bottom, as of the last scroll event. Gates the
  // re-pin on window resize (see onContainerLayout).
  const isNearBottomRef = useRef(true);
  const containerHeightRef = useRef<number | null>(null);
  const resizePinFrameRef = useRef<number | null>(null);
  // Near-bottom as of the moment the keyboard started to show or hide, before the resize could
  // disturb it. Cleared once the keyboard has settled.
  const keyboardPinnedRef = useRef(false);
  const keyboardPinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True while the user drags the list and through the fling that follows. A user scroll always
  // wins over the keyboard, resize and end re-pins. Android also fires the momentum events for
  // programmatic animated scrolls (scrollToEnd), so momentum only counts right after a drag ends.
  const userScrollingRef = useRef(false);
  const dragEndedAtRef = useRef(0);
  // Until this time (ms), content growth while the list sits at the end re-pins the end. Set by the
  // scroll-to-bottom buttons and the page fill; cleared by a user drag.
  const endPinUntilRef = useRef(0);
  // The edge a scroll button sent the list to, until the list reaches it. On Android, an animated
  // scroll is cancelled wherever it is when the native maintainVisibleContentPosition shifts the
  // offset (FlashList's correction as a cell measures or a page arrives). Right after a fling that
  // happens often, and the button then seemed only to stop the fling. Cleared by a touch on the list.
  const buttonTargetRef = useRef<ButtonScrollTarget | null>(null);
  // Set when an older page is loaded into an end-anchored list that does not fill the viewport yet.
  // Such a list is bottom-aligned by a FlashList margin that goes away as it fills, which FlashList's
  // position correction does not count, so the end is pinned once the content outgrows the viewport.
  const pinEndOnFillRef = useRef(false);

  const dataLengthRef = useRef(data.length);
  const dataRef = useRef(data);
  const handleLoadNextRef = useRef(handleLoadNext);
  const handleLoadPreviousRef = useRef(handleLoadPrevious);
  // The index anchor is tracked by item key, not position: an older page can be prepended (FlashList
  // fires onStartReached at mount when the anchor is near the top) before positioning finishes, which
  // shifts every index. Captured once at mount, like FlashList's own initialScrollIndex.
  const [anchorKey] = useState(() =>
    anchorIndex !== undefined && anchorIndex < data.length ? keyExtractor(data[anchorIndex]) : undefined,
  );
  const onReadyToShowRef = useRef(onReadyToShow);
  const readyFiredRef = useRef(false);
  const [ready, setReady] = useState(false);
  const readyFrameRef = useRef<number | null>(null);
  const ownScrollFrameRef = useRef<number | null>(null);
  const prevKeysRef = useRef(getEdgeKeys(data, keyExtractor));

  // Fallback path only: with START_RENDERING_FROM_BOTTOM off, an end-anchored list opens on its last
  // item. Index 0 is excluded because scrolling to it would hide the list header for no reason.
  const [fallbackEndIndex] = useState(() => getFallbackEndIndex(data.length));
  // Index 0 is also excluded for index anchors: initialScrollIndex scrolls the item to the top edge
  // past the header, and the first item is already visible from offset 0.
  const initialScrollIndex = getInitialScrollIndex(anchor, fallbackEndIndex, START_RENDERING_FROM_BOTTOM);
  // FlashList scrolls to `layout.y + viewOffset`, so a negative offset leaves the item below the top edge.
  const initialScrollIndexParams = useMemo(
    () => (initialScrollIndex !== undefined && !anchorsToEnd ? {viewOffset: -styleDefaults.marginSize} : undefined),
    [initialScrollIndex, anchorsToEnd, styleDefaults.marginSize],
  );

  // The threshold is deliberately not gated on our own near-bottom state: FlashList checks proximity
  // itself, and driving the prop from scroll state would rebuild this object on scroll and race a post
  // that arrives before the state settles. It is undefined while more pages exist because scrollToEnd
  // goes to the end of the loaded window, and following a tail that is not the real tail is wrong.
  const maintainVisibleContentPosition = useMemo(
    () => ({
      startRenderingFromBottom: START_RENDERING_FROM_BOTTOM && anchorsToEnd,
      autoscrollToBottomThreshold: effectiveFollowTail && !hasNextPage ? AUTOSCROLL_TO_BOTTOM_THRESHOLD : undefined,
      animateAutoScrollToBottom: true,
    }),
    [anchorsToEnd, effectiveFollowTail, hasNextPage],
  );

  useEffect(() => {
    dataLengthRef.current = data.length;
    dataRef.current = data;
    onReadyToShowRef.current = onReadyToShow;
    handleLoadNextRef.current = handleLoadNext;
    handleLoadPreviousRef.current = handleLoadPrevious;
  });

  // Every frame and timer started here is cancelled on unmount. Parent screens remount the list via
  // `key`, and a callback from a replaced instance must never reveal the new one early.
  useEffect(() => {
    return () => {
      if (readyFrameRef.current !== null) {
        cancelAnimationFrame(readyFrameRef.current);
      }
      if (ownScrollFrameRef.current !== null) {
        cancelAnimationFrame(ownScrollFrameRef.current);
      }
      if (resizePinFrameRef.current !== null) {
        cancelAnimationFrame(resizePinFrameRef.current);
      }
    };
  }, []);

  /** Fires `onReadyToShow` at most once. */
  const fireReadyToShow = useCallback(() => {
    if (readyFiredRef.current) {
      return;
    }
    readyFiredRef.current = true;
    setReady(true);
    logger.debug('Firing onReadyToShow');
    onReadyToShowRef.current?.();
  }, []);

  /** The furthest the list can scroll, from FlashList's own measurements. Undefined before layout. */
  const getEndOffset = useCallback((): number | undefined => {
    const list = listRef.current;
    if (!list) {
      return undefined;
    }
    try {
      return computeEndOffset(
        list.getChildContainerDimensions().height,
        list.getFirstItemOffset(),
        list.getWindowSize().height,
      );
    } catch (error) {
      logger.debug('getEndOffset measurement unavailable', error);
      return undefined;
    }
  }, [listRef]);

  /**
   * Measures how far (in pixels) the current scroll offset is from the anchor's target offset (see
   * `computeAnchorError`). Undefined when layout is not available yet.
   */
  const getAnchorError = useCallback(
    (index?: number) => {
      const list = listRef.current;
      const endOffset = getEndOffset();
      if (!list || endOffset === undefined) {
        return undefined;
      }
      let itemY: number | undefined;
      if (index !== undefined) {
        const layout = list.getLayout(index);
        if (!layout) {
          return undefined;
        }
        itemY = layout.y;
      }
      // Our own onScroll metrics update on the scroll event itself; FlashList's tracked offset is
      // updated from a deferred velocity callback and lags a correction by a frame or more.
      const offset = scrollMetricsRef.current?.offset ?? list.getAbsoluteLastScrollOffset();
      return computeAnchorError({
        offset,
        endOffset,
        itemY,
        firstItemOffset: list.getFirstItemOffset(),
        margin: styleDefaults.marginSize,
      });
    },
    [getEndOffset, listRef, styleDefaults.marginSize],
  );

  /** Current index of the anchored item, falling back to the mount-time index if its key is gone. */
  const resolveAnchorIndex = useCallback(
    (fallback: number) => resolveAnchorIndexIn(dataRef.current, keyExtractor, anchorKey, fallback),
    [anchorKey, keyExtractor],
  );

  /**
   * Starts the per-frame check that reveals the list once the initial scroll has landed, with a
   * bounded fallback so the parent's overlay can never stick. The decisions are in `stepReadyCheck`
   * (`src/Libraries/ChatList/Anchor.ts`), which explains the corrections.
   */
  const startReadyCheck = useCallback(() => {
    let state: ReadyCheckState = initialReadyCheckState;
    const tick = () => {
      readyFrameRef.current = null;
      const step = stepReadyCheck(state, () =>
        getAnchorError(anchorIndex === undefined ? undefined : resolveAnchorIndex(anchorIndex)),
      );
      state = step.state;
      if (step.scrollTo !== undefined) {
        logger.debug(`Anchor correction ${state.corrections}: off by ${Math.round(state.lastError ?? 0)}px`);
        listRef.current?.scrollToOffset({offset: step.scrollTo, animated: false});
      }
      if (step.ready) {
        fireReadyToShow();
      } else {
        readyFrameRef.current = requestAnimationFrame(tick);
      }
    };
    readyFrameRef.current = requestAnimationFrame(tick);
  }, [anchorIndex, getAnchorError, resolveAnchorIndex, fireReadyToShow, listRef]);

  /**
   * FlashList fires `onLoad` once after first layout. That is not "initial scroll done", so it only
   * starts the position check above. Empty lists have nothing to position and are ready at once.
   */
  const onLoad = useCallback(() => {
    if (dataLengthRef.current === 0) {
      fireReadyToShow();
      return;
    }
    startReadyCheck();
  }, [fireReadyToShow, startReadyCheck]);

  // Explicit guard in case onLoad does not fire for empty data. The frame re-checks emptiness so a
  // callback queued while empty cannot reveal a list that has since received data, and the effect
  // cleanup cancels it on unmount.
  const isEmpty = data.length === 0;
  useEffect(() => {
    if (!isEmpty) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      if (dataLengthRef.current === 0) {
        fireReadyToShow();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isEmpty, fireReadyToShow]);

  // Posts arriving from others are followed by FlashList's autoscrollToBottomThreshold. The user's
  // own posts must always land in view, and only this component sees the data reach the list (a
  // parent calling scrollToEnd right after updating the cache fires a render or more too early).
  // End growth is told apart from a prepend (loading older posts, #610) by comparing the first and
  // last keys: a prepend changes the first key; an end append changes the last key and leaves the first.
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

  /**
   * Derives which floating scroll button to show from the latest scroll metrics. With a "New"
   * divider the primary button points toward it; without one it points down. Hidden when the divider
   * is in or near the viewport or the user is near the bottom.
   *
   * `getLayout(index).y` is relative to the list's child container, which starts below the header,
   * so the header height (`getFirstItemOffset`) is added to compare against scroll offsets.
   */
  const computeScrollButtonDirection = useCallback((): ScrollButtonDirection => {
    const metrics = scrollMetricsRef.current;
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
  }, [listRef, newDividerIndex, styleDefaults.listScrollThreshold]);

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

  const lastIndex = data.length - 1;
  /**
   * Renders the caller's item, with the gap below the last post inside the last cell. FlashList
   * leaves ListFooterComponent out of its scroll extent (getMaxScrollOffset), so a footer spacer made
   * scrollToEnd from far away land short and then hop the footer's height once FlashList finished
   * with a native scrollToEnd. Every cell gets the wrapper so the last one doesn't remount when a
   * newer post arrives.
   */
  const renderItemWithEndGap = useCallback<ListRenderItem<TItem>>(
    info => (
      <View style={info.index === lastIndex ? commonStyles.paddingBottomSmall : undefined}>{renderItem(info)}</View>
    ),
    [commonStyles.paddingBottomSmall, lastIndex, renderItem],
  );

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

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      scrollMetricsRef.current = {
        offset: contentOffset.y,
        viewportHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
      };
      const distanceFromBottom = getDistanceFromBottom(scrollMetricsRef.current);
      isNearBottomRef.current = distanceFromBottom <= styleDefaults.listScrollThreshold;
      applyAtTop(contentOffset.y);
      const buttonTarget = buttonTargetRef.current;
      if (
        buttonTarget &&
        hasReachedButtonEdge(buttonTarget.edge, contentOffset.y, distanceFromBottom, styleDefaults.marginSize)
      ) {
        buttonTargetRef.current = null;
      }

      // FlashList's onStartReached stops firing after a few prepends that add less than a threshold of
      // content (Shopify/flash-list#1785), so also load older posts directly when near the top. The
      // pagination hook ignores calls while a fetch is in flight. Not before the initial position has
      // settled, when the offset is transiently 0.
      if (
        handleLoadPrevious &&
        shouldNudgeLoadPrevious({
          ready: readyFiredRef.current,
          hasPreviousPage,
          offset: contentOffset.y,
          viewportHeight: layoutMeasurement.height,
        })
      ) {
        handleLoadPrevious();
      }

      applyScrollButtonDirection();
    },
    [
      applyAtTop,
      applyScrollButtonDirection,
      handleLoadPrevious,
      hasPreviousPage,
      styleDefaults.listScrollThreshold,
      styleDefaults.marginSize,
    ],
  );

  // FlashList's onStartReached/onEndReached and the nudge in onScroll all depend on scroll events. A
  // list too short to scroll never gets one, and startRenderingFromBottom leaves FlashList's tracked
  // offset at the last item, which can be outside its start threshold. So a short first page sat on
  // "Loading previous..." forever. This checks the position once the list is ready and after each
  // page. It re-checks with a growing delay because a load can also fail or be cancelled by a
  // refetch. The handlers are read from refs: they change identity around every fetch, and restarting
  // here on that would retry a failing load with no delay. The pagination hook ignores calls while a
  // fetch is in flight.
  //
  // The position is FlashList's tracked offset, not our last scroll event. FlashList swallows the
  // scroll event of its own correction after a prepend, so the last event still says the list is at
  // the top, and going by it loaded every older page in a row. The same goes for the state derived
  // from that event, so the first check after a page refreshes it.
  useEffect(() => {
    if (!ready) {
      return;
    }
    let delay = PAGE_FILL_DELAY_MS;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const list = listRef.current;
      const endOffset = getEndOffset();
      if (list && endOffset !== undefined) {
        const viewportHeight = list.getWindowSize().height;
        const offset = Math.min(list.getAbsoluteLastScrollOffset(), endOffset);
        if (delay === PAGE_FILL_DELAY_MS && scrollMetricsRef.current) {
          scrollMetricsRef.current = {...scrollMetricsRef.current, offset};
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
        if (action.load === 'previous') {
          pinEndOnFillRef.current = action.pinEndOnFill;
          handleLoadPreviousRef.current?.();
        } else if (action.load === 'next') {
          handleLoadNextRef.current?.();
        }
      }
      if (hasPreviousPage || hasNextPage) {
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
    data.length,
    getEndOffset,
    hasNextPage,
    hasPreviousPage,
    listRef,
    ready,
  ]);

  /** Primary button: to the "New" divider when there is one, else to the end of the list. */
  /**
   * Scrolls to the end for a button press and keeps the end pinned for END_PIN_MS, so a tall last
   * post whose image measures in after landing (or a page that arrives) doesn't leave the list short
   * of the bottom with the buttons already hidden.
   */
  const scrollToEndFromButton = useCallback(() => {
    endPinUntilRef.current = Date.now() + END_PIN_MS;
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef]);

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

  const handleScrollButtonPress = useCallback(() => {
    if (newDividerIndex !== undefined) {
      listRef.current?.scrollToIndex({index: newDividerIndex, animated: true, viewPosition: DIVIDER_VIEW_POSITION});
    } else {
      startButtonScroll('end');
    }
  }, [listRef, newDividerIndex, startButtonScroll]);

  /** Secondary button: to the list edge opposite the primary button's direction. */
  const handleSecondaryScrollButtonPress = useCallback(() => {
    startButtonScroll(getSecondaryEdge(scrollButtonDirection));
  }, [scrollButtonDirection, startButtonScroll]);

  /** Scrolls to the end on the next frame, replacing any pending re-pin. */
  const scheduleRepin = useCallback(() => {
    if (resizePinFrameRef.current !== null) {
      cancelAnimationFrame(resizePinFrameRef.current);
    }
    resizePinFrameRef.current = requestAnimationFrame(() => {
      resizePinFrameRef.current = null;
      listRef.current?.scrollToEnd({animated: false});
    });
  }, [listRef]);

  /**
   * The content grew or shrank without a scroll (a page loaded, an image measured). Re-derives the
   * buttons, which may have hidden for a bottom that has since moved away; the next scroll event
   * refreshes everything else. Within the button's end-pin window, growth while the list sat at the
   * end re-pins the end. Not mid-animation: the list is only "at the end" once it has landed.
   * Outgrowing the viewport after a page fill (see pinEndOnFillRef) opens the same window.
   */
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      const viewportHeight = containerHeightRef.current;
      if (hasOutgrownViewport(pinEndOnFillRef.current, viewportHeight, height)) {
        pinEndOnFillRef.current = false;
        if (!userScrollingRef.current) {
          endPinUntilRef.current = Date.now() + END_PIN_MS;
          scheduleRepin();
        }
      }
      const metrics = scrollMetricsRef.current;
      if (!metrics || metrics.contentHeight === height) {
        return;
      }
      scrollMetricsRef.current = {...metrics, contentHeight: height};
      if (
        shouldRepinOnContentGrowth({
          metrics,
          contentHeight: height,
          now: Date.now(),
          endPinUntil: endPinUntilRef.current,
          userScrolling: userScrollingRef.current,
        })
      ) {
        scheduleRepin();
      }
      applyScrollButtonDirection();
    },
    [applyScrollButtonDirection, scheduleRepin],
  );

  /**
   * Keyboard: the KeyboardAvoidingView around the list and composer resizes this container, frame by
   * frame on Android. FlashList's own autoscroll on window resize was not enough on the Android
   * emulator: after the keyboard closed the list often settled about one post short of the bottom.
   * So any resize while the user was near the bottom re-pins the end (this also covers rotation and
   * split-screen resizes), and the keyboard listeners below add a final pass once it has settled.
   */
  const onContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      const previous = containerHeightRef.current;
      containerHeightRef.current = height;
      if (
        shouldRepinOnResize({
          previousHeight: previous,
          height,
          ready: readyFiredRef.current,
          userScrolling: userScrollingRef.current,
          nearBottom: isNearBottomRef.current,
          keyboardPinned: keyboardPinnedRef.current,
        })
      ) {
        scheduleRepin();
      }
    },
    [scheduleRepin],
  );

  /**
   * Cancels any pending keyboard or resize re-pin. Called when the user starts to drag, so the
   * delayed re-pins after the keyboard closes don't pull a user who has started scrolling back to
   * the bottom.
   */
  const cancelRepins = useCallback(() => {
    keyboardPinnedRef.current = false;
    endPinUntilRef.current = 0;
    if (keyboardPinTimerRef.current !== null) {
      clearTimeout(keyboardPinTimerRef.current);
      keyboardPinTimerRef.current = null;
    }
    if (resizePinFrameRef.current !== null) {
      cancelAnimationFrame(resizePinFrameRef.current);
      resizePinFrameRef.current = null;
    }
  }, []);

  /** A user drag has started: stop all re-pins. */
  const onUserScrollStart = useCallback(() => {
    userScrollingRef.current = true;
    cancelRepins();
  }, [cancelRepins]);

  /**
   * Any touch on the list hands it back to the user. Touching it stops an animated scroll on Android,
   * and onMomentumEnd must not take that for a cancelled button scroll and send it again.
   */
  const onListTouchStart = useCallback(() => {
    buttonTargetRef.current = null;
  }, []);

  /** A user drag has ended; a fling may follow (see onMomentumBegin). */
  const onUserScrollEnd = useCallback(() => {
    userScrollingRef.current = false;
    dragEndedAtRef.current = Date.now();
  }, []);

  /** Momentum that starts as a drag ends is the user's fling; any other momentum is programmatic. */
  const onMomentumBegin = useCallback(() => {
    if (isUserFling(Date.now(), dragEndedAtRef.current)) {
      userScrollingRef.current = true;
    }
  }, []);

  /**
   * A fling (or programmatic momentum) has ended. A button scroll that ended short of its edge (onScroll
   * clears the target once it lands) was cancelled on the way, so it is sent again.
   */
  const onMomentumEnd = useCallback(() => {
    const buttonTarget = buttonTargetRef.current;
    if (buttonTarget) {
      if (getButtonRetryAction(buttonTarget, Date.now()) === 'clear') {
        buttonTargetRef.current = null;
      } else {
        buttonTarget.retries += 1;
        scrollToButtonEdge(buttonTarget.edge);
      }
    }
    userScrollingRef.current = false;
  }, [scrollToButtonEdge]);

  // Near-bottom is snapshotted when the keyboard starts moving (scroll events during the resize can
  // briefly report the user as far from the bottom). react-native-keyboard-controller's
  // KeyboardProvider emits the Will events on iOS, but they did not arrive on the Android emulator,
  // so the Did handler also accepts the near-bottom state at that moment.
  //
  // After the keyboard settles, a pinned list re-pins on the next frame and then at a few fixed
  // delays, unconditionally. On Android, closing the keyboard reported the list container as
  // transiently taller than its final size, and the final, smaller layout often never reached JS:
  // every JS-side measure (onLayout, FlashList's window size, the end offset) still said "at the bottom"
  // while the native view had shrunk and hid the last post. scrollToEnd goes through the native
  // scroll view, which knows the real size, and is a no-op when already at the end. Bounded; not a loop.
  // A user drag cancels the remaining re-pins (see cancelRepins).
  // The transient height came from Paper's BottomNavigation.Bar hiding itself on the keyboard
  // (keyboardHidesNavigationBar), which AppBottomTabBar now turns off. The delayed re-pins stay as
  // a fallback for other resizes that land after keyboardDidShow/Hide.
  useEffect(() => {
    const onWill = () => {
      keyboardPinnedRef.current = readyFiredRef.current && isNearBottomRef.current;
    };
    const onDid = () => {
      const pinned = shouldPinAfterKeyboard({
        userScrolling: userScrollingRef.current,
        keyboardPinned: keyboardPinnedRef.current,
        ready: readyFiredRef.current,
        nearBottom: isNearBottomRef.current,
      });
      keyboardPinnedRef.current = pinned;
      if (!pinned) {
        return;
      }
      scheduleRepin();
      if (keyboardPinTimerRef.current !== null) {
        clearTimeout(keyboardPinTimerRef.current);
      }
      const repinAfter = (step: number) => {
        keyboardPinTimerRef.current = setTimeout(() => {
          keyboardPinTimerRef.current = null;
          listRef.current?.scrollToEnd({animated: false});
          if (step + 1 < KEYBOARD_SETTLE_DELAYS_MS.length) {
            repinAfter(step + 1);
          } else {
            keyboardPinnedRef.current = false;
          }
        }, KEYBOARD_SETTLE_DELAYS_MS[step]);
      };
      repinAfter(0);
    };
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', onWill),
      Keyboard.addListener('keyboardWillHide', onWill),
      Keyboard.addListener('keyboardDidShow', onDid),
      Keyboard.addListener('keyboardDidHide', onDid),
    ];
    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      if (keyboardPinTimerRef.current !== null) {
        clearTimeout(keyboardPinTimerRef.current);
      }
    };
  }, [listRef, scheduleRepin]);

  return (
    <View style={commonStyles.flex} onLayout={onContainerLayout}>
      <FlashList<TItem>
        ref={listRef}
        data={data}
        renderItem={renderItemWithEndGap}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        extraData={extraData}
        drawDistance={drawDistance}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        initialScrollIndex={initialScrollIndex}
        initialScrollIndexParams={initialScrollIndexParams}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={refreshControl}
        onStartReached={handleLoadPrevious}
        onEndReached={handleLoadNext}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onTouchStart={onListTouchStart}
        onScrollBeginDrag={onUserScrollStart}
        onScrollEndDrag={onUserScrollEnd}
        onMomentumScrollBegin={onMomentumBegin}
        onMomentumScrollEnd={onMomentumEnd}
        onLoad={onLoad}
        contentContainerStyle={contentContainerStyle}
        scrollsToTop={false}
      />
      {effectiveScrollButton && scrollButtonDirection !== null && (
        // The stack renders top to bottom, so up stays above down regardless of
        // which direction is primary.
        <FloatingScrollButtonsView
          actions={
            scrollButtonDirection === 'up'
              ? [
                  {testID: 'conversationListScroll-button', icon: AppIcons.scrollUp, onPress: handleScrollButtonPress},
                  {
                    testID: 'conversationListSecondaryScroll-button',
                    icon: AppIcons.scrollDown,
                    onPress: handleSecondaryScrollButtonPress,
                  },
                ]
              : [
                  {
                    testID: 'conversationListSecondaryScroll-button',
                    icon: AppIcons.scrollUp,
                    onPress: handleSecondaryScrollButtonPress,
                    disabled: atTop,
                  },
                  {
                    testID: 'conversationListScroll-button',
                    icon: AppIcons.scrollDown,
                    onPress: handleScrollButtonPress,
                  },
                ]
          }
        />
      )}
    </View>
  );
};
