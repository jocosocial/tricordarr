import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef} from 'react';
import {RefreshControlProps} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {ForumThreadListItem} from '#src/Components/Lists/Items/Forum/ForumThreadListItem';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {ForumListData} from '#src/Structs/ControllerStructs';

interface ForumThreadListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious?: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  categoryID?: string;
  keyExtractor?: (item: ForumListData) => string;
  onScrollThreshold?: (value: boolean) => void;
  scrollToTopIntent?: number;
}

/**
 * A list of forum threads.
 */
export const ForumThreadList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  hasNextPage,
  hasPreviousPage,
  categoryID,
  keyExtractor = (item: ForumListData) => item.forumID,
  onScrollThreshold,
  scrollToTopIntent,
}: ForumThreadListProps) => {
  const listRef = useRef<FlashListRef<ForumListData>>(null);
  const {enableSelection, setEnableSelection, selectedItems} = useSelection();

  useEffect(() => {
    if (scrollToTopIntent) {
      listRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

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
          selected={selectedItems.some(i => i.id === item.forumID)}
        />
      );
    },
    [categoryID, enableSelection, selectedItems, setEnableSelection],
  );

  const renderItemSeparator = () => <Divider bold={true} />;

  return (
    <AppFlashList<ForumListData>
      ref={listRef}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      renderItem={renderItem}
      data={forumListData}
      onScrollThreshold={onScrollThreshold}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      renderItemSeparator={renderItemSeparator}
    />
  );
};
