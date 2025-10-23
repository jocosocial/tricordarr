import { LegendList, LegendListRef, LegendListRenderItemProps } from "@legendapp/list"
import React, {useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps} from 'react-native';

import { FloatingScrollButton } from "#src/Components/Buttons/FloatingScrollButton";
import { useStyles } from "#src/Context/Contexts/StyleContext";
import {FloatingScrollButtonPosition} from '#src/Types';


interface ConversationListProps<TItem> {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  listRef: React.RefObject<LegendListRef | null>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  renderItem: ({item}: LegendListRenderItemProps<TItem>) => React.ReactNode;
  data: TItem[];
  scrollButtonPosition?: FloatingScrollButtonPosition;
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
  keyExtractor: (item: TItem) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ItemSeparatorComponent?: React.ComponentType<{leadingItem: TItem}>;
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
  scrollButtonPosition = 'raised',
  onScrollThreshold,
  enableScrollButton = true,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
}: ConversationListProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);

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
    listRef.current?.scrollToEnd({ animated: true });
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

  /**
   * Scroll to the end of the list when the component mounts.
   * 
   * In the reference example at https://github.com/Shopify/flash-list/issues/1844#issuecomment-3221732641
   * there is mention of using an "init" skeleton view to hide things before this completes. idk if we
   * need that here.
   * 
   * @TODO ok yeah I think that is needed because it gets weird with loading next pages.
   */
  React.useEffect(() => {
    listRef.current?.scrollToEnd({ animated: false });
  }, [listRef]);

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
      />
      {enableScrollButton && showScrollButton && (
        <FloatingScrollButton
          onPress={handleScrollButtonPress}
          displayPosition={scrollButtonPosition}
        />
      )}
    </>
  );
};
