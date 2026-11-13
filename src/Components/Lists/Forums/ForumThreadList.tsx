import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList, RefreshControlProps} from 'react-native';

import {AppFlatList} from '#src/Components/Lists/AppFlatList';
import {ForumThreadListItem} from '#src/Components/Lists/Items/Forum/ForumThreadListItem';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
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
  const listRef = useRef<FlatList<ForumListData>>(null);
  const {enableSelection, setEnableSelection, selectedItems} = useSelection();
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({
    data: forumListData,
    hasNextPage,
    hasPreviousPage,
  });

  useEffect(() => {
    if (scrollToTopIntent) {
      listRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

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

  return (
    <AppFlatList<ForumListData>
      ref={listRef}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      renderItem={renderItem}
      data={forumListData}
      onScrollThreshold={onScrollThreshold}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      renderItemSeparator={getListSeparator}
    />
  );
};
