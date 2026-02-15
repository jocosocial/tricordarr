import {LegendList, LegendListRef, LegendListRenderItemProps} from '@legendapp/list';
import React, {useCallback, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, View, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {createLogger} from '#src/Libraries/Logger';
import {RNFlatListSeparatorComponent} from '#src/Types';

const logger = createLogger('ConversationListV2.tsx');

export type TConversationListV2Ref = LegendListRef | null;
export type TConversationListV2RefObject = React.RefObject<TConversationListV2Ref>;

interface ConversationListV2Props<TItem> {
  listRef: TConversationListV2RefObject;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  renderItem: ({item}: LegendListRenderItemProps<TItem>) => React.ReactNode;
  data: TItem[];
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
  keyExtractor: (item: TItem) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ItemSeparatorComponent?: RNFlatListSeparatorComponent<TItem>;
  initialScrollIndex?: number;
  style?: StyleProp<ViewStyle>;
  /** When true, items are bottom-aligned (chat-style). Use for fully-read threads. */
  alignItemsAtEnd?: boolean;
  /** Estimated average item height for LegendList's layout engine. */
  estimatedItemSize?: number;
  /**
   * Callback fired once the list has reached the correct initial scroll position.
   * The parent should hide any overlay/loader once this fires.
   */
  onReadyToShow?: () => void;
}

/**
 * V2 of the chat-style conversation list.
 *
 * Key improvements over V1:
 * - "Ready to show" pattern: fires `onReadyToShow` once positioned correctly,
 *   allowing the parent to render an overlay until then.
 * - Configurable `alignItemsAtEnd` (not always-on).
 * - `maintainVisibleContentPosition` to stabilize scroll on layout shifts.
 * - `estimatedItemSize` passthrough for LegendList.
 *
 * ## Implementation Guide for Domain Wrappers
 *
 * This component is not used directly by screens. Instead, create a domain-specific
 * wrapper that composes it (see `ForumConversationListV2`, `FezConversationListV2`).
 * The wrapper is responsible for:
 * - Providing `renderItem`, `keyExtractor`, header/footer/separator components.
 * - Deriving `alignItemsAtEnd` and computing `showNewDivider` from domain data.
 * - Choosing an appropriate `estimatedItemSize` for the content type
 *   (forum posts ~120, chat messages ~100).
 *
 * ## Overlay / readyToShow Pattern
 *
 * Parent screens should:
 * 1. Hold `readyToShow` state (initially `false`).
 * 2. Pass an `onReadyToShow` callback that sets it to `true`.
 * 3. Render a full-size `ActivityIndicator` overlay (position absolute, zIndex 1,
 *    background matching `theme.colors.background`) over the list area while
 *    `!readyToShow`. This hides the initial scroll positioning from the user.
 * See `ForumThreadScreenBase` and `FezChatScreen` for reference implementations.
 *
 * ## alignItemsAtEnd
 *
 * - `true` for fully-read threads: content bottom-aligns so the latest message
 *   is visible. Pair with `initialScrollIndex = data.length - 1`.
 * - `false` for partially-read threads: the list scrolls to `initialScrollIndex`
 *   (typically the first unread item). Calculate as:
 *     `Math.max(readCount - paginator.start, 0)`
 *
 * ## estimatedItemSize
 *
 * Provide a best-guess average rendered height for items in the list. LegendList
 * uses this for its virtual layout engine. Overestimating causes gaps; underestimating
 * causes jumps. Measure a few representative items to calibrate.
 */
export const ConversationListV2 = <TItem,>({
  listRef,
  data,
  refreshControl,
  handleLoadPrevious,
  handleLoadNext,
  onScrollThreshold,
  enableScrollButton = true,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  initialScrollIndex,
  style,
  alignItemsAtEnd = false,
  estimatedItemSize,
  onReadyToShow,
}: ConversationListV2Props<TItem>) => {
  const {commonStyles, styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const readyFiredRef = useRef(false);

  // Stabilization state: tracks content height changes between onLoad and readyToShow.
  const isStabilizingRef = useRef(false);
  const lastSeenContentHeightRef = useRef(0);
  const stabilizeRafRef = useRef<number | null>(null);

  const fireReadyToShow = useCallback(() => {
    if (!readyFiredRef.current && onReadyToShow) {
      readyFiredRef.current = true;
      isStabilizingRef.current = false;
      logger.debug('Firing onReadyToShow');
      onReadyToShow();
    }
  }, [onReadyToShow]);

  /**
   * Start (or restart) a rAF countdown that calls scrollToEnd each frame.
   * When the countdown completes without being reset, fires readyToShow.
   *
   * Reset by onScroll when it detects a content height change during stabilization.
   */
  const scheduleReadyToShow = useCallback(() => {
    if (stabilizeRafRef.current !== null) {
      cancelAnimationFrame(stabilizeRafRef.current);
    }
    // 8 frames at 60fps ≈ 133ms. Logs showed content changes up to ~86ms after
    // onLoad, so 133ms provides a safety margin while staying imperceptible.
    let framesRemaining = 8;
    const tick = () => {
      if (!isStabilizingRef.current) {
        return;
      }
      if (alignItemsAtEnd) {
        listRef.current?.scrollToEnd({animated: false});
      }
      framesRemaining--;
      if (framesRemaining <= 0) {
        fireReadyToShow();
      } else {
        stabilizeRafRef.current = requestAnimationFrame(tick);
      }
    };
    stabilizeRafRef.current = requestAnimationFrame(tick);
  }, [alignItemsAtEnd, listRef, fireReadyToShow]);

  const handleScrollButtonPress = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      const scrollThresholdCondition = distanceFromBottom > styleDefaults.listScrollThreshold;
      setShowScrollButton(scrollThresholdCondition);
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }

      // During stabilization, detect content height changes and re-scroll + reset timer.
      if (isStabilizingRef.current) {
        if (contentSize.height !== lastSeenContentHeightRef.current) {
          lastSeenContentHeightRef.current = contentSize.height;
          if (alignItemsAtEnd) {
            listRef.current?.scrollToEnd({animated: false});
          }
          scheduleReadyToShow(); // Reset stabilization countdown
        }
      }
    },
    [onScrollThreshold, styleDefaults.listScrollThreshold, alignItemsAtEnd, listRef, scheduleReadyToShow],
  );

  /**
   * LegendList fires `onLoad` after it has completed initial layout and rendering.
   *
   * Three-phase positioning for alignItemsAtEnd (fully-read threads):
   *   Phase 1: `initialScrollIndex` (set by the parent) gets the viewport near the
   *            last item during LegendList's layout engine.
   *   Phase 2: `scrollToEnd` in onLoad snaps to the current bottom.
   *   Phase 3: Stabilization loop — rAF frames keep calling `scrollToEnd` while
   *            onScroll monitors for content height changes. If content changes,
   *            the loop resets. Once content is stable for several frames,
   *            `fireReadyToShow` removes the overlay.
   *
   * The overlay stays up through all three phases, so positioning is invisible.
   */
  const onLoad = useCallback(() => {
    logger.debug('LegendList onLoad fired');
    if (alignItemsAtEnd && data.length > 0) {
      listRef.current?.scrollToEnd({animated: false});
      isStabilizingRef.current = true;
      lastSeenContentHeightRef.current = 0;
      scheduleReadyToShow();
    } else {
      // Non-alignItemsAtEnd case: single rAF is sufficient since we don't need
      // to be at the bottom.
      requestAnimationFrame(() => {
        fireReadyToShow();
      });
    }
  }, [fireReadyToShow, scheduleReadyToShow, alignItemsAtEnd, data.length, listRef]);

  return (
    <View style={commonStyles.flex}>
      <LegendList
        ref={listRef}
        // Required Props
        data={data}
        renderItem={renderItem}
        // Recommended props
        keyExtractor={keyExtractor}
        recycleItems={true}
        // Chat interface props
        alignItemsAtEnd={alignItemsAtEnd}
        maintainScrollAtEnd={alignItemsAtEnd}
        maintainVisibleContentPosition={true}
        maintainScrollAtEndThreshold={alignItemsAtEnd ? 0.1 : undefined}
        // Layout
        estimatedItemSize={estimatedItemSize}
        initialScrollIndex={initialScrollIndex}
        waitForInitialLayout={true}
        // Components
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={refreshControl}
        // Pagination
        onStartReached={handleLoadPrevious}
        onEndReached={handleLoadNext}
        // Events
        onScroll={onScroll}
        onLoad={onLoad}
        style={style}
      />
      {enableScrollButton && showScrollButton && <FloatingScrollButton onPress={handleScrollButtonPress} />}
    </View>
  );
};
