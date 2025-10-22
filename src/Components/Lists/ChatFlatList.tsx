import React, {useCallback} from 'react';
import {FlatList, ListRenderItemInfo, RefreshControlProps} from 'react-native';

import {AppFlatList} from '#src/Components/Lists/AppFlatList';
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
  flatListRef: React.RefObject<FlatList<FezPostData>>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  maintainViewPosition?: boolean;
  fezPostData: FezPostData[];
  scrollButtonPosition: FloatingScrollButtonPosition;
}

export const ChatFlatList = ({
  hasPreviousPage,
  flatListRef,
  fez,
  refreshControl,
  handleLoadPrevious,
  handleLoadNext,
  hasNextPage,
  maintainViewPosition,
  fezPostData,
  scrollButtonPosition,
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

  const renderItem = ({item, index, separators}: ListRenderItemInfo<FezPostData>) => (
    <PaddedContentView padBottom={false}>
      {showNewDivider(index) && <LabelDivider label={'New'} />}
      <FezPostListItem fezPost={item} index={index} separators={separators} fez={fez} />
    </PaddedContentView>
  );

  return (
    <AppFlatList
      invertList={true}
      flatListRef={flatListRef}
      renderItem={renderItem}
      data={fezPostData}
      renderListHeader={renderHeader}
      refreshControl={refreshControl}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      maintainViewPosition={maintainViewPosition}
      renderItemSeparator={SpaceDivider}
      scrollButtonPosition={scrollButtonPosition}
    />
  );
};
