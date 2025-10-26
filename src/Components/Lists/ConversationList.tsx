import {LegendList, LegendListRef, LegendListRenderItemProps} from '@legendapp/list';
import React, {useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FloatingScrollButtonVerticalPosition, RNFlatListSeparatorComponent} from '#src/Types';

export type TConversationListRef = LegendListRef | null;
export type TConversationListRefObject = React.RefObject<TConversationListRef>;

interface ConversationListProps<TItem> {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  listRef: TConversationListRefObject;
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
  scrollButtonVerticalPosition?: FloatingScrollButtonVerticalPosition;
}

/**
 * A chat-style conversation.
 */
export const ConversationList = <TItem,>({
  // hasPreviousPage,
  listRef,
  data,
  refreshControl,
  handleLoadPrevious,
  handleLoadNext,
  // hasNextPage,
  onScrollThreshold,
  enableScrollButton = true,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  initialScrollIndex,
  style,
  scrollButtonVerticalPosition = 'raised',
}: ConversationListProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [init, setInit] = useState(true);
  const [hasLayout, setHasLayout] = useState(false);
  const {appConfig} = useConfig();

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
   * Not anymore.
   *
   * animated: true seems to improve some performance in the simulator, idk if it matters
   * in real life.
   */
  const handleScrollButtonPress = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef]);

  /**
   * There are basically two types of list:
   * - Inverted: Things like read Forums and Seamail that start at the bottom.
   * - Uninverted: Things like unread Forums and LFG Lists that start at the top.
   *
   * At one point I had this, but it's not relevant anymore. Saving for later.
   *   event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
   *     styleDefaults.listScrollThreshold * 2,
   */
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Calculate distance from bottom: when at bottom, this is ~0; when scrolled up, this increases
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

  const onLayout = useCallback(() => {
    if (!hasLayout) setHasLayout(true);
  }, [hasLayout]);

  /**
   * Scroll to the end of the list when the component mounts.
   * Run initial scroll only once after layout and data are ready
   *
   * Lifted from a reference implementation https://github.com/Shopify/flash-list/issues/1844#issuecomment-3221732641
   */
  React.useEffect(() => {
    if (!init) return;
    if (!hasLayout) return;
    if (!data || data.length === 0) return;

    if (initialScrollIndex) {
      console.log('[ConversationList.tsx] useEffect scrollToIndex', initialScrollIndex);
      listRef.current?.scrollToIndex({index: initialScrollIndex, animated: false});
    } else {
      console.log('[ConversationList.tsx] useEffect scrollToEnd');
      listRef.current?.scrollToEnd({animated: false});
    }

    requestAnimationFrame(() => {
      setInit(false);
    });
  }, [init, hasLayout, data, listRef, initialScrollIndex]);

  return (
    <>
      <LegendList
        ref={listRef}
        // Required Props
        data={data}
        renderItem={renderItem}
        // Recommended props (Improves performance)
        keyExtractor={keyExtractor}
        recycleItems={true}
        // chat interface props
        alignItemsAtEnd
        maintainScrollAtEnd
        maintainVisibleContentPosition={true}
        maintainScrollAtEndThreshold={0.1}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={refreshControl}
        onStartReached={handleLoadPrevious}
        onEndReached={handleLoadNext}
        onScroll={onScroll}
        onLayout={onLayout}
        initialScrollIndex={initialScrollIndex}
        style={style}
      />
      {enableScrollButton && showScrollButton && (
        <FloatingScrollButton
          onPress={handleScrollButtonPress}
          verticalPosition={scrollButtonVerticalPosition}
          horizontalPosition={appConfig.userPreferences.reverseSwipeOrientation ? 'left' : 'right'}
        />
      )}
    </>
  );
};
