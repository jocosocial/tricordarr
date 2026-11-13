import React, {forwardRef, useCallback} from 'react';
import {FlatList, RefreshControlProps} from 'react-native';

import {AppFlatList} from '#src/Components/Lists/AppFlatList';
import {BoardgameListItem} from '#src/Components/Lists/Items/BoardgameListItem';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {BoardgameData} from '#src/Structs/ControllerStructs';

interface BoardgameFlatListProps {
  items: BoardgameData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  listHeader?: React.ComponentType<any>;
}

const BoardgameFlatListInner = (
  {
    items,
    refreshControl,
    onEndReached: _onEndReached,
    onScrollThreshold,
    hasNextPage,
    hasPreviousPage: _hasPreviousPage,
    handleLoadNext,
    handleLoadPrevious: _handleLoadPrevious,
    listHeader,
  }: BoardgameFlatListProps,
  ref: React.ForwardedRef<FlatList<BoardgameData>>,
) => {
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({data: items, hasNextPage});

  const renderItem = useCallback(({item}: {item: BoardgameData}) => {
    return <BoardgameListItem boardgame={item} />;
  }, []);

  return (
    <AppFlatList<BoardgameData>
      ref={ref}
      refreshControl={refreshControl}
      renderItem={renderItem}
      data={items}
      keyExtractor={(item: BoardgameData) => item.gameID}
      renderListHeader={listHeader || getListHeader}
      renderListFooter={getListFooter}
      renderItemSeparator={getListSeparator}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
    />
  );
};

export const BoardgameFlatList = forwardRef(BoardgameFlatListInner) as (
  props: BoardgameFlatListProps & {ref?: React.ForwardedRef<FlatList<BoardgameData>>},
) => ReturnType<typeof BoardgameFlatListInner>;
