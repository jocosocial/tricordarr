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

  const fireReadyToShow = useCallback(() => {
    if (!readyFiredRef.current && onReadyToShow) {
      readyFiredRef.current = true;
      logger.debug('Firing onReadyToShow');
      onReadyToShow();
    }
  }, [onReadyToShow]);

  const handleScrollButtonPress = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const distanceFromBottom =
        event.nativeEvent.contentSize.height -
        event.nativeEvent.layoutMeasurement.height -
        event.nativeEvent.contentOffset.y;
      const scrollThresholdCondition = distanceFromBottom > styleDefaults.listScrollThreshold;
      setShowScrollButton(scrollThresholdCondition);
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }
    },
    [onScrollThreshold, styleDefaults.listScrollThreshold],
  );

  /**
   * LegendList fires `onLoad` after it has completed initial layout and rendering.
   * We use this as the signal that the list is positioned correctly.
   *
   * Two-phase positioning for alignItemsAtEnd (fully-read threads):
   *   Phase 1: `initialScrollIndex` (set by the parent) gets the viewport near the
   *            last item during LegendList's layout engine. This is approximate because
   *            LegendList uses `estimatedItemSize` for off-screen items -- images,
   *            multi-line text, and separators make actual heights vary.
   *   Phase 2: Once `onLoad` fires (items near the target are rendered with real heights),
   *            `scrollToEnd` snaps to the true bottom. Because phase 1 already placed
   *            us close, the nearby content is laid out and `scrollToEnd` targets the
   *            correct offset (unlike calling it from position 0 where most content
   *            hasn't been rendered yet).
   *
   * The overlay stays up until after `fireReadyToShow`, so both phases are invisible.
   */
  const onLoad = useCallback(() => {
    logger.debug('LegendList onLoad fired');
    if (alignItemsAtEnd && data.length > 0) {
      listRef.current?.scrollToEnd({animated: false});
    }
    // Give one extra frame for layout to settle, then signal ready.
    requestAnimationFrame(() => {
      fireReadyToShow();
    });
  }, [fireReadyToShow, alignItemsAtEnd, data.length, listRef]);

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
