import {FlatList, ListRenderItemInfo, RefreshControlProps} from 'react-native';
import {FezData, FezPostData} from '../../libraries/Structs/ControllerStructs.tsx';
import {PaddedContentView} from '../Views/Content/PaddedContentView.tsx';
import {LabelDivider} from './Dividers/LabelDivider.tsx';
import {FezPostListItem} from './Items/FezPostListItem.tsx';
import React, {useCallback} from 'react';
import {AppFlatList} from './AppFlatList.tsx';
import {LoadingPreviousHeader} from './Headers/LoadingPreviousHeader.tsx';
import {FezPostListHeader} from './Headers/FezPostListHeader.tsx';
import {SpaceDivider} from './Dividers/SpaceDivider.tsx';
import {FloatingScrollButtonPosition} from '../../libraries/Types';

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
    return hasPreviousPage ? <LoadingPreviousHeader /> : <FezPostListHeader />;
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
