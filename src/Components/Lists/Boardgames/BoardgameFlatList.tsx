import {type FlashListRef} from '@shopify/flash-list';
import React, {forwardRef, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
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
  ref: React.ForwardedRef<FlashListRef<BoardgameData>>,
) => {
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({data: items, hasNextPage});

  const renderItem = useCallback(({item}: {item: BoardgameData}) => {
    return <BoardgameListItem boardgame={item} />;
  }, []);

  return (
    <AppFlashList<BoardgameData>
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
  props: BoardgameFlatListProps & {ref?: React.ForwardedRef<FlashListRef<BoardgameData>>},
) => ReturnType<typeof BoardgameFlatListInner>;
