import { LegendList, LegendListRef, LegendListRenderItemProps } from "@legendapp/list"
import React, {useCallback, useRef} from 'react';
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
  flatListRef: React.RefObject<LegendListRef>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
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

  const renderItem = ({item, index}: LegendListRenderItemProps<FezPostData>) => (
    <PaddedContentView padBottom={false}>
      {showNewDivider(index) && <LabelDivider label={'New'} />}
      <FezPostListItem fezPost={item} index={index} fez={fez} />
    </PaddedContentView>
  );

  const keyExtractor = useCallback((item: FezPostData) => item.postID.toString(), []);

  // Putting this in a useCallback caused some weird list jumping behavior that I also
  // saw when shoving the component in the `ItemSeparatorComponent` prop below.
  const renderDivider = () => <SpaceDivider />;

  React.useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: false });
  }, [flatListRef]);

  return (
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
    />
  );
};
