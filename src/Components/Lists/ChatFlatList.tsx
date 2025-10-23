import {LegendListRef, LegendListRenderItemProps } from "@legendapp/list"
import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import { ConversationList } from "#src/Components/Lists/ConversationList";
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {ChatFlatListHeader} from '#src/Components/Lists/Headers/ChatFlatListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {FezPostListItem} from '#src/Components/Lists/Items/FezPostListItem';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
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

  return (
    <ConversationList<FezPostData>
      listRef={flatListRef}
      data={fezPostData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderHeader}
      ItemSeparatorComponent={renderDivider}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      scrollButtonPosition={scrollButtonPosition}
      enableScrollButton={enableScrollButton}
      onScrollThreshold={onScrollThreshold}
    />
  );
};
