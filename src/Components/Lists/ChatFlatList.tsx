import { LegendList, LegendListRef, LegendListRenderItemProps } from "@legendapp/list"
import React, {useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps} from 'react-native';

import { FloatingScrollButton } from "#src/Components/Buttons/FloatingScrollButton";
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {ChatFlatListHeader} from '#src/Components/Lists/Headers/ChatFlatListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {FezPostListItem} from '#src/Components/Lists/Items/FezPostListItem';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import { useStyles } from "#src/Context/Contexts/StyleContext";
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';
import {FloatingScrollButtonPosition} from '#src/Types';


interface ChatFlatListProps {
  fez: FezData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  flatListRef: React.RefObject<LegendListRef>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  fezPostData: FezPostData[];
  scrollButtonPosition: FloatingScrollButtonPosition;
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
}

/**
 * A list of Fez posts. Means a chat conversation.
 * 
 * @TODO test loading a seamail with tons of unread messages.
 */
export const ChatFlatList = ({
  hasPreviousPage,
  flatListRef,
  fez,
  refreshControl,
  handleLoadPrevious,
  handleLoadNext,
  // hasNextPage,
  fezPostData,
  scrollButtonPosition,
  onScrollThreshold,
  enableScrollButton = true,
}: ChatFlatListProps) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const renderHeader = () => {
    return hasPreviousPage ? <LoadingPreviousHeader /> : <ChatFlatListHeader />;
  };

  const showNewDivider = useCallback(
    (index: number) => {
      if (fez && fez.members) {
        if (fez.members.postCount === fez.members.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        return fez.members.postCount - index === fez.members.readCount + 1;
      }
    },
    [fez],
  );

  /**
   * Render function for each ite in the list.
   * 
   * @returns The rendered item.
   */
  const renderItem = ({item, index}: LegendListRenderItemProps<FezPostData>) => (
    <PaddedContentView padBottom={false}>
      {showNewDivider(index) && <LabelDivider label={'New'} />}
      <FezPostListItem fezPost={item} index={index} fez={fez} />
    </PaddedContentView>
  );

  /**
   * A key extractor for the list.
   * 
   * @param item - The item to extract a key from.
   * @returns The key for the item.
   */
  const keyExtractor = useCallback((item: FezPostData) => item.postID.toString(), []);


  /**
   * Putting this in a useCallback caused some weird list jumping behavior that I also
   * saw when shoving the component in the `ItemSeparatorComponent` prop below.
   */
  const renderDivider = () => <SpaceDivider />;

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
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [flatListRef]);

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
    flatListRef.current?.scrollToEnd({ animated: false });
  }, [flatListRef]);

  return (
    <>
      <LegendList
        ref={flatListRef}
        // Required Props
        data={fezPostData}
        renderItem={renderItem}

        // Recommended props (Improves performance)
        keyExtractor={keyExtractor}
        recycleItems={true}      

        // chat interface props
        alignItemsAtEnd
        maintainScrollAtEnd
        maintainVisibleContentPosition={true}
        maintainScrollAtEndThreshold={0.1}

        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={renderDivider}
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
