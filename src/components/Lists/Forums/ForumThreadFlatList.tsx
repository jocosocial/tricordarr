import {RefreshControlProps} from 'react-native';
import {ForumThreadListItem} from '#src/Components/Lists/Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef} from 'react';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {Divider} from 'react-native-paper';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {FlashList} from '@shopify/flash-list';

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
  const flatListRef = useRef<FlashList<ForumListData>>(null);
  const {enableSelection, setEnableSelection, selectedForums} = useSelection();

  const renderListHeader = () => {
    // Turning this off because the list renders too quickly based on the state data.
    // if (forumListData.length === 0) {
    //   return <TimeDivider label={'No forums to display'} />;
    // }
    if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    return <></>;
  };

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    if (forumListData.length !== 0) {
      return <EndResultsFooter />;
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
    <AppFlashList
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
      renderItemSeparator={renderItemSeparator}
      estimatedItemSize={106}
    />
  );
};
