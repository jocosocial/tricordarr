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
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('ChatList.tsx');

export type TChatListRef<TItem> = FlashListRef<TItem> | null;
export type TChatListRefObject<TItem> = React.RefObject<TChatListRef<TItem>>;

/**
 * Whether a chat anchored to the end lets FlashList start from the bottom
 * (`maintainVisibleContentPosition.startRenderingFromBottom`). This is the single switch for the
 * first fallback in `docs/Specifications/Bi-Directional Chat List.md`: set it to false if
 * `startRenderingFromBottom` misbehaves on a device (short chats, Android flicker). The list then
 * opens via `initialScrollIndex = last item` instead, which leaves chats shorter than the viewport
 * top-aligned.
 */
const START_RENDERING_FROM_BOTTOM = true;

/** Fraction of the viewport from the bottom within which FlashList keeps following new content. */
const AUTOSCROLL_TO_BOTTOM_THRESHOLD = 0.2;

/** Fraction of the viewport from the top below which the load-previous nudge fires. */
const LOAD_PREVIOUS_NUDGE_FRACTION = 0.2;

/** Frames the ready check waits before revealing the list regardless of position (~750ms at 60fps). */
const READY_MAX_FRAMES = 45;

/** Pixels of slack when deciding the viewport is at the bottom (the footer is not in the measured content). */
const AT_BOTTOM_EPSILON = 50;

/**
 * After a scroll-to-bottom button press, how long the list keeps re-pinning the end when content
 * below it grows (an image measuring in, the next page arriving). Bounded; a user drag ends it early.
 */
const END_PIN_MS = 2000;

/** Momentum beginning within this long of a drag ending is the user's fling, not a programmatic scroll. */
const FLING_AFTER_DRAG_MS = 100;

/** Frames after onLoad before correcting an index anchor; FlashList's initial scroll settles within ~100ms. */
const ANCHOR_CORRECTION_START_FRAME = 9;

/** Frames to wait after a corrective scroll before measuring again, so the scroll event has landed. */
const ANCHOR_CORRECTION_WAIT_FRAMES = 3;

/** Pixels an index anchor may be off its target and still count as positioned. */
const ANCHOR_TOLERANCE = 8;

/** Consecutive in-tolerance frames before an index anchor counts as settled. */
const ANCHOR_SETTLED_FRAMES = 2;

/** Upper bound on corrective scrolls for an index anchor, so measuring images cannot loop it. */
const ANCHOR_MAX_CORRECTIONS = 4;

/**
 * Delays (from keyboardDid*, then between steps) at which a pinned list re-pins the end, covering the
 * KeyboardAvoidingView's last layout passes (~1.1s total).
 */
const KEYBOARD_SETTLE_DELAYS_MS = [100, 300, 700];

/** Fraction of the viewport the New divider is placed below the top edge when scrolling to it. */
const DIVIDER_VIEW_POSITION = 0.1;

type ScrollButtonDirection = 'up' | 'down' | null;

interface ScrollMetrics {
  offset: number;
  viewportHeight: number;
  contentHeight: number;
}

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
  // At the top edge, where the scroll-to-top button has nothing to do and is greyed out.
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
  // scroll-to-bottom buttons; cleared by a user drag.
  const endPinUntilRef = useRef(0);

  const dataLengthRef = useRef(data.length);
  const dataRef = useRef(data);
  // The index anchor is tracked by item key, not position: an older page can be prepended (FlashList
  // fires onStartReached at mount when the anchor is near the top) before positioning finishes, which
  // shifts every index. Captured once at mount, like FlashList's own initialScrollIndex.
  const [anchorKey] = useState(() =>
    anchorIndex !== undefined && anchorIndex < data.length ? keyExtractor(data[anchorIndex]) : undefined,
  );
  const onReadyToShowRef = useRef(onReadyToShow);
  const readyFiredRef = useRef(false);
  const readyFrameRef = useRef<number | null>(null);
  const ownScrollFrameRef = useRef<number | null>(null);
  const prevKeysRef = useRef<{first?: string; last?: string}>({
    first: data.length > 0 ? keyExtractor(data[0]) : undefined,
    last: data.length > 0 ? keyExtractor(data[data.length - 1]) : undefined,
  });

  // Fallback path only: with START_RENDERING_FROM_BOTTOM off, an end-anchored list opens on its last
  // item. Index 0 is excluded because scrolling to it would hide the list header for no reason.
  const [fallbackEndIndex] = useState(() => (data.length > 1 ? data.length - 1 : undefined));
  // Index 0 is also excluded for index anchors: initialScrollIndex scrolls the item to the top edge
  // past the header, and the first item is already visible from offset 0.
  const initialScrollIndex = anchorsToEnd
    ? START_RENDERING_FROM_BOTTOM
      ? undefined
      : fallbackEndIndex
    : anchorIndex && anchorIndex > 0
      ? anchorIndex
      : undefined;
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
      const contentHeight = list.getChildContainerDimensions().height + list.getFirstItemOffset();
      return Math.max(contentHeight - list.getWindowSize().height, 0);
    } catch (error) {
      logger.debug('getEndOffset measurement unavailable', error);
      return undefined;
    }
  }, [listRef]);

  /**
   * How far (in pixels) the current scroll offset is from the anchor's target offset, using measured
   * layouts. An index anchor's top sits `marginSize` below the top edge, clamped to the furthest the
   * list can scroll; an end anchor (no index) is at that furthest offset. Undefined when layout is
   * not available yet.
   */
  const getAnchorError = useCallback(
    (index?: number): {error: number; target: number} | undefined => {
      const list = listRef.current;
      const endOffset = getEndOffset();
      if (!list || endOffset === undefined) {
        return undefined;
      }
      let target = endOffset;
      if (index !== undefined) {
        const layout = list.getLayout(index);
        if (!layout) {
          return undefined;
        }
        target = Math.min(layout.y + list.getFirstItemOffset() - styleDefaults.marginSize, endOffset);
      }
      // Our own onScroll metrics update on the scroll event itself; FlashList's tracked offset is
      // updated from a deferred velocity callback and lags a correction by a frame or more.
      const offset = scrollMetricsRef.current?.offset ?? list.getAbsoluteLastScrollOffset();
      return {error: offset - target, target};
    },
    [getEndOffset, listRef, styleDefaults.marginSize],
  );

  /** Current index of the anchored item, falling back to the mount-time index if its key is gone. */
  const resolveAnchorIndex = useCallback(
    (fallback: number) => {
      if (anchorKey === undefined) {
        return fallback;
      }
      const index = dataRef.current.findIndex(item => keyExtractor(item) === anchorKey);
      return index >= 0 ? index : fallback;
    },
    [anchorKey, keyExtractor],
  );

  /**
   * Starts the per-frame check that reveals the list once the initial scroll has landed, with a
   * bounded fallback so the parent's overlay can never stick.
   *
   * For an index anchor, FlashList's initialScrollIndex lands using estimated heights for unmeasured
   * items, so tall items (forum images) leave the anchor well off its target
   * (Shopify/flash-list#2307). Once FlashList's own initial scroll window has passed, this compares
   * the anchor's measured position with the scroll offset and nudges with a plain scrollToOffset
   * (a bounded number of times) until it holds still. scrollToIndex is not used here: it pauses and
   * re-enables offset correction on its own timers, which raced the initial scroll and overshot.
   *
   * For an end anchor, startRenderingFromBottom lands on the top of the last item, which is not the
   * end when that item is taller than the viewport (a gallery). The same nudges take it there.
   */
  const startReadyCheck = useCallback(() => {
    let frames = 0;
    let corrections = 0;
    let settledFrames = 0;
    let nextMeasureFrame = ANCHOR_CORRECTION_START_FRAME;
    let lastError: number | undefined;
    const tick = () => {
      readyFrameRef.current = null;
      frames++;
      let positioned: boolean;
      if (frames < nextMeasureFrame) {
        positioned = false;
      } else {
        const anchorError = getAnchorError(anchorIndex === undefined ? undefined : resolveAnchorIndex(anchorIndex));
        if (!anchorError) {
          positioned = false;
        } else if (Math.abs(anchorError.error) <= ANCHOR_TOLERANCE) {
          settledFrames++;
          positioned = settledFrames >= ANCHOR_SETTLED_FRAMES;
        } else if (lastError !== undefined && Math.abs(anchorError.error - lastError) <= ANCHOR_TOLERANCE) {
          // The last nudge did not change the measured error, so the list cannot get any closer
          // (the end of the content, or a measurement that does not track this scroll). Waiting
          // for the fallback would only delay the reveal.
          positioned = true;
        } else {
          settledFrames = 0;
          positioned = false;
          if (corrections < ANCHOR_MAX_CORRECTIONS) {
            corrections++;
            lastError = anchorError.error;
            nextMeasureFrame = frames + ANCHOR_CORRECTION_WAIT_FRAMES;
            logger.debug(`Anchor correction ${corrections}: off by ${Math.round(anchorError.error)}px`);
            listRef.current?.scrollToOffset({offset: anchorError.target, animated: false});
          }
        }
      }
      if (positioned || frames >= READY_MAX_FRAMES) {
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
    const first = data.length > 0 ? keyExtractor(data[0]) : undefined;
    const last = data.length > 0 ? keyExtractor(data[data.length - 1]) : undefined;
    const prev = prevKeysRef.current;
    prevKeysRef.current = {first, last};
    const wasEmpty = prev.last === undefined;
    const isEndAppend = last !== undefined && last !== prev.last && (first === prev.first || wasEmpty);
    if (!isEndAppend || !isOwnItem?.(data[data.length - 1])) {
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
    const threshold = styleDefaults.listScrollThreshold;
    const distanceFromBottom = metrics.contentHeight - metrics.viewportHeight - metrics.offset;
    if (distanceFromBottom <= threshold) {
      return null;
    }
    const list = listRef.current;
    const layout = newDividerIndex !== undefined ? list?.getLayout(newDividerIndex) : undefined;
    if (!list || !layout) {
      return 'down';
    }
    const dividerTop = layout.y + list.getFirstItemOffset();
    const dividerBottom = dividerTop + layout.height;
    const viewportTop = metrics.offset;
    const viewportBottom = metrics.offset + metrics.viewportHeight;
    if (dividerBottom < viewportTop) {
      return viewportTop - dividerBottom <= threshold ? null : 'up';
    }
    if (dividerTop > viewportBottom) {
      return dividerTop - viewportBottom <= threshold ? null : 'down';
    }
    return null;
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

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      scrollMetricsRef.current = {
        offset: contentOffset.y,
        viewportHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
      };
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      isNearBottomRef.current = distanceFromBottom <= styleDefaults.listScrollThreshold;
      const nowAtTop = contentOffset.y <= styleDefaults.marginSize;
      if (nowAtTop !== atTopRef.current) {
        atTopRef.current = nowAtTop;
        setAtTop(nowAtTop);
      }

      // FlashList's onStartReached stops firing after a few prepends that add less than a threshold of
      // content (Shopify/flash-list#1785), so also load older posts directly when near the top. The
      // pagination hook ignores calls while a fetch is in flight. Not before the initial position has
      // settled, when the offset is transiently 0.
      if (
        readyFiredRef.current &&
        hasPreviousPage &&
        handleLoadPrevious &&
        contentOffset.y < layoutMeasurement.height * LOAD_PREVIOUS_NUDGE_FRACTION
      ) {
        handleLoadPrevious();
      }

      applyScrollButtonDirection();
    },
    [
      applyScrollButtonDirection,
      handleLoadPrevious,
      hasPreviousPage,
      styleDefaults.listScrollThreshold,
      styleDefaults.marginSize,
    ],
  );

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

  const handleScrollButtonPress = useCallback(() => {
    if (newDividerIndex !== undefined) {
      listRef.current?.scrollToIndex({index: newDividerIndex, animated: true, viewPosition: DIVIDER_VIEW_POSITION});
    } else {
      scrollToEndFromButton();
    }
  }, [listRef, newDividerIndex, scrollToEndFromButton]);

  /** Secondary button: to the list edge opposite the primary button's direction. */
  const handleSecondaryScrollButtonPress = useCallback(() => {
    if (scrollButtonDirection === 'up') {
      scrollToEndFromButton();
    } else {
      listRef.current?.scrollToOffset({offset: 0, animated: true});
    }
  }, [listRef, scrollButtonDirection, scrollToEndFromButton]);

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
   */
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      const metrics = scrollMetricsRef.current;
      if (!metrics || metrics.contentHeight === height) {
        return;
      }
      const wasAtEnd = metrics.contentHeight - metrics.viewportHeight - metrics.offset <= AT_BOTTOM_EPSILON;
      scrollMetricsRef.current = {...metrics, contentHeight: height};
      if (
        wasAtEnd &&
        height > metrics.contentHeight &&
        Date.now() < endPinUntilRef.current &&
        !userScrollingRef.current
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
      if (previous === null || previous === height || !readyFiredRef.current) {
        return;
      }
      if (!userScrollingRef.current && (isNearBottomRef.current || keyboardPinnedRef.current)) {
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

  /** A user drag has ended; a fling may follow (see onMomentumBegin). */
  const onUserScrollEnd = useCallback(() => {
    userScrollingRef.current = false;
    dragEndedAtRef.current = Date.now();
  }, []);

  /** Momentum that starts as a drag ends is the user's fling; any other momentum is programmatic. */
  const onMomentumBegin = useCallback(() => {
    if (Date.now() - dragEndedAtRef.current <= FLING_AFTER_DRAG_MS) {
      userScrollingRef.current = true;
    }
  }, []);

  /** A fling (or programmatic momentum) has ended. */
  const onMomentumEnd = useCallback(() => {
    userScrollingRef.current = false;
  }, []);

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
      const pinned =
        !userScrollingRef.current && (keyboardPinnedRef.current || (readyFiredRef.current && isNearBottomRef.current));
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
