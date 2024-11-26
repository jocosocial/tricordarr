import {FlatList, RefreshControlProps} from 'react-native';
import {ForumThreadListItem} from '../Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef} from 'react';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {Divider, Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ConversationFlatList} from '../ConversationFlatList.tsx';
import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';

interface ForumThreadFlatListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  maintainViewPosition?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  categoryID?: string;
  keyExtractor?: (item: ForumListData) => string;
  onScrollThreshold?: (value: boolean) => void;
}

export const ForumThreadFlatList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  maintainViewPosition,
  hasNextPage,
  hasPreviousPage,
  categoryID,
  keyExtractor = (item: ForumListData) => item.forumID,
  onScrollThreshold,
}: ForumThreadFlatListProps) => {
  const flatListRef = useRef<FlatList<ForumListData>>(null);
  const {enableSelection, setEnableSelection, selectedForums} = useSelection();

  const renderListHeader = () => {
    // Turning this off because the list renders too quickly based on the state data.
    // if (forumListData.length === 0) {
    //   return <TimeDivider label={'No forums to display'} />;
    // }
    if (hasPreviousPage) {
      return (
        <PaddedContentView>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>Loading previous...</Text>
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    return <></>;
  };

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return (
        <PaddedContentView>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>Loading next...</Text>
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    if (forumListData.length !== 0) {
      return (
        <>
          <Divider bold={true} />
          <PaddedContentView>
            <FlexCenteredContentView>
              <Text variant={'labelMedium'}>End of results</Text>
            </FlexCenteredContentView>
          </PaddedContentView>
        </>
      );
    }
    return <SpaceDivider />;
  }, [forumListData.length, hasNextPage]);

  const renderItem = useCallback(
    ({item}: {item: ForumListData}) => {
      return (
        <ForumThreadListItem
          forumListData={item}
          categoryID={categoryID}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
          selected={selectedForums.some(i => i.forumID === item.forumID)}
        />
      );
    },
    [categoryID, enableSelection, selectedForums, setEnableSelection],
  );

  const renderItemSeparator = () => <Divider bold={true} />;

  return (
    <ConversationFlatList
      flatListRef={flatListRef}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      renderItem={renderItem}
      data={forumListData}
      onScrollThreshold={onScrollThreshold}
      keyExtractor={keyExtractor}
      maintainViewPosition={maintainViewPosition}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      renderItemSeparator={renderItemSeparator}
    />
  );
};
