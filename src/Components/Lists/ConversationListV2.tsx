import {LegendList, LegendListRef, LegendListRenderItemProps} from '@legendapp/list';
import React, {useCallback, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, View, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
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
  /**
   * When true, LegendList will keep the scroll position at the end when new items
   * are appended (if the user is already near the bottom).
   *
   * Defaults to the value of `alignItemsAtEnd`. Override to `true` for real-time
   * chat lists where `alignItemsAtEnd` may oscillate due to server read-state lag
   * but the user should still see new messages immediately.
   */
  maintainScrollAtEnd?: boolean;
  /** Estimated average item height for LegendList's layout engine. */
  estimatedItemSize?: number;
  /**
   * Callback fired once the list has reached the correct initial scroll position.
   * The parent should hide any overlay/loader once this fires.
   */
  onReadyToShow?: () => void;
  /**
   * Index of the "New" divider item in the data array. When set, the floating
   * scroll button navigates to this divider instead of the end of the list, and
   * its icon reflects whether the divider is above or below the current viewport.
   * The button hides when the user is within `listScrollThreshold` of the divider
   * or the bottom of the list.
   */
  newDividerIndex?: number;
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
  enableScrollButton,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  initialScrollIndex,
  style,
  alignItemsAtEnd = false,
  maintainScrollAtEnd,
  estimatedItemSize,
  onReadyToShow,
  newDividerIndex,
}: ConversationListV2Props<TItem>) => {
  // Default maintainScrollAtEnd to follow alignItemsAtEnd when not explicitly provided.
  const effectiveMaintainScrollAtEnd = maintainScrollAtEnd ?? alignItemsAtEnd;
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
  // null = hidden, 'up' | 'down' = visible with that icon direction.
  const [scrollButtonDirection, setScrollButtonDirection] = useState<'up' | 'down' | null>(null);
  const readyFiredRef = useRef(false);
  const prevDataLengthRef = useRef(data.length);

  // Track whether the user is near the bottom of the list. Used to decide whether
  // to auto-scroll when new items arrive. Updated in onScroll.
  const isNearBottomRef = useRef(true);

  // Track content height to detect pagination-induced layout shifts that would
  // cause the scroll button to flash. When content height jumps significantly
  // (new page loaded), we suppress hidden→visible transitions for the button.
  const prevContentHeightRef = useRef(0);
  const prevButtonDirectionRef = useRef<'up' | 'down' | null>(null);

  // Stabilization state: tracks content height changes between onLoad and readyToShow.
  const isStabilizingRef = useRef(false);
  const lastSeenContentHeightRef = useRef(0);
  const stabilizeRafRef = useRef<number | null>(null);

  // When data grows and the user was near the bottom, explicitly scroll to the end.
  // LegendList's maintainScrollAtEnd is unreliable for dynamic appends, so we
  // supplement it with our own scroll-to-end call.
  if (data.length > prevDataLengthRef.current && readyFiredRef.current) {
    if (effectiveMaintainScrollAtEnd && isNearBottomRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({animated: true});
      });
    }
  }
  prevDataLengthRef.current = data.length;

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
    if (newDividerIndex !== undefined) {
      listRef.current?.scrollToIndex({index: newDividerIndex, animated: true});
    } else {
      listRef.current?.scrollToEnd({animated: true});
    }
  }, [listRef, newDividerIndex]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentSize, layoutMeasurement, contentOffset} = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      const threshold = styleDefaults.listScrollThreshold;

      // Track whether the user is near the bottom. Used by the data-grow scroll
      // logic above. A generous threshold (~1.5 items) ensures we catch cases where
      // maintainScrollAtEnd would have been slightly out of range.
      isNearBottomRef.current = distanceFromBottom <= (estimatedItemSize ?? 100) * 1.5;

      // onScrollThreshold always uses distance-from-bottom, regardless of divider.
      const scrollThresholdCondition = distanceFromBottom > threshold;
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }

      // Scroll button visibility & direction.
      if (newDividerIndex !== undefined) {
        const viewportTop = contentOffset.y;
        const viewportBottom = contentOffset.y + layoutMeasurement.height;

        // Estimate the divider's pixel position. This is approximate (~100px error)
        // because it doesn't account for headers, separators, or variable item heights.
        // However, it naturally tracks pagination changes because newDividerIndex
        // updates when pages are prepended/appended.
        const estimatedDividerPosition = newDividerIndex * (estimatedItemSize ?? 100);

        // Distance from the nearest viewport edge to the divider.
        let distanceFromDivider: number;
        if (estimatedDividerPosition < viewportTop) {
          distanceFromDivider = viewportTop - estimatedDividerPosition;
        } else if (estimatedDividerPosition > viewportBottom) {
          distanceFromDivider = estimatedDividerPosition - viewportBottom;
        } else {
          distanceFromDivider = 0; // Divider is within the viewport.
        }

        const nearDivider = distanceFromDivider <= threshold;
        const nearBottom = distanceFromBottom <= threshold;

        // Hysteresis: once hidden, require a larger distance to re-show.
        // This prevents oscillation when contentHeight fluctuates from cell
        // recycling, causing distances to wobble across the hide threshold.
        const hysteresis = (estimatedItemSize ?? 100) * 2;
        const wasHidden = prevButtonDirectionRef.current === null;
        const showThreshold = threshold + hysteresis;

        // Determine the desired button direction for this frame.
        let newDirection: 'up' | 'down' | null;
        if (wasHidden) {
          // Button is hidden — require extra clearance to show (hysteresis).
          if (distanceFromDivider <= showThreshold || distanceFromBottom <= showThreshold) {
            newDirection = null;
          } else {
            newDirection = estimatedDividerPosition < viewportTop ? 'up' : 'down';
          }
        } else {
          // Button is visible — use normal threshold to hide.
          if (nearDivider || nearBottom) {
            newDirection = null;
          } else {
            newDirection = estimatedDividerPosition < viewportTop ? 'up' : 'down';
          }
        }

        // Suppress hidden→visible transitions caused by pagination/recycling.
        // When content height changes (a page loaded or items recycled),
        // distanceFromBottom can briefly jump. We suppress the SHOW transition.
        const contentHeightDelta = Math.abs(contentSize.height - prevContentHeightRef.current);
        prevContentHeightRef.current = contentSize.height;
        if (newDirection !== null && wasHidden && contentHeightDelta > 0) {
          newDirection = null;
        }
        prevButtonDirectionRef.current = newDirection;

        setScrollButtonDirection(newDirection);
      } else {
        // No divider — original behavior: show down arrow when far from bottom.
        const newDir = scrollThresholdCondition ? 'down' : null;
        prevButtonDirectionRef.current = newDir;
        prevContentHeightRef.current = contentSize.height;
        setScrollButtonDirection(newDir);
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
    [
      onScrollThreshold,
      styleDefaults.listScrollThreshold,
      alignItemsAtEnd,
      listRef,
      scheduleReadyToShow,
      estimatedItemSize,
      newDividerIndex,
    ],
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
        maintainScrollAtEnd={effectiveMaintainScrollAtEnd}
        maintainVisibleContentPosition={true}
        maintainScrollAtEndThreshold={effectiveMaintainScrollAtEnd ? 0.1 : undefined}
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
      {effectiveScrollButton && scrollButtonDirection !== null && (
        <FloatingScrollButton
          onPress={handleScrollButtonPress}
          icon={scrollButtonDirection === 'up' ? AppIcons.scrollUp : AppIcons.scrollDown}
        />
      )}
    </View>
  );
};
