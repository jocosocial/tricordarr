import React, {useCallback} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {type TConversationListV2RefObject} from '#src/Components/Lists/ConversationListV2';
import {ConversationListV2} from '#src/Components/Lists/ConversationListV2';
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ChatFlatListHeader} from '#src/Components/Lists/Headers/ChatFlatListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {FezPostListItem} from '#src/Components/Lists/Items/FezPostListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezConversationListV2Props {
  fez: FezData;
  fezPostData: FezPostData[];
  listRef: TConversationListV2RefObject;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  initialScrollIndex?: number;
  /** Callback fired once the list has reached its initial scroll position. */
  onReadyToShow?: () => void;
}

/**
 * V2 fez conversation list. Wraps ConversationListV2 with fez-specific rendering.
 * Used for Seamail, LFG, and PersonalEvent chat screens.
 *
 * Key differences from ChatFlatList (V1):
 * - Configurable `alignItemsAtEnd` based on whether the chat is fully read.
 * - Exposes `onReadyToShow` to the parent screen for overlay control.
 * - Proper footer with `LoadingNextFooter` when paginating forward.
 * - Uses `paginator.start` for accurate "New" divider placement.
 */
export const FezConversationListV2 = ({
  fez,
  fezPostData,
  listRef,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  hasPreviousPage,
  hasNextPage,
  initialScrollIndex,
  onReadyToShow,
}: FezConversationListV2Props) => {
  const {commonStyles} = useStyles();

  // The chat is fully read when readCount equals postCount.
  const isFullyRead = fez.members ? fez.members.readCount === fez.members.postCount : true;

  const showNewDivider = useCallback(
    (index: number) => {
      if (fez.members) {
        if (fez.members.postCount === fez.members.readCount) {
          return false;
        }
        const loadedStartIndex = fez.members.paginator.start;
        return fez.members.readCount - loadedStartIndex === index;
      }
      return false;
    },
    [fez.members],
  );

  const renderItem = useCallback(
    ({item, index}: {item: FezPostData; index: number}) => {
      return (
        <View>
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <FezPostListItem fezPost={item} index={index} fez={fez} />
        </View>
      );
    },
    [fez, showNewDivider],
  );

  const renderSeparator = useCallback(() => <SpaceDivider />, []);

  const renderListHeader = useCallback(() => {
    if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    return <ChatFlatListHeader />;
  }, [hasPreviousPage]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <SpaceDivider />;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: FezPostData) => item.postID.toString(), []);

  return (
    <ConversationListV2<FezPostData>
      listRef={listRef}
      data={fezPostData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ItemSeparatorComponent={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      enableScrollButton={true}
      initialScrollIndex={initialScrollIndex}
      alignItemsAtEnd={isFullyRead}
      estimatedItemSize={100}
      onReadyToShow={onReadyToShow}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      style={commonStyles.paddingHorizontalSmall}
    />
  );
};
