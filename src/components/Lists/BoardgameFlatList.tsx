import {RefreshControlProps} from 'react-native';
import React, {useCallback, useRef} from 'react';
import {Divider} from 'react-native-paper';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {BoardgameListItem} from '#src/Components/Lists/Items/BoardgameListItem';
import {BoardgameData} from '#src/Structs/ControllerStructs';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {FlashList} from '@shopify/flash-list';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';

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

export const BoardgameFlatList = (props: BoardgameFlatListProps) => {
  const flatListRef = useRef<FlashList<BoardgameData>>(null);

  const getListSeparator = useCallback(() => {
    return <Divider bold={true} />;
  }, []);

  const renderItem = useCallback(({item}: {item: BoardgameData}) => {
    return <BoardgameListItem boardgame={item} />;
  }, []);

  const getListHeader = useCallback(() => {
    if (props.items.length > 0) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [props.items.length]);

  const getListFooter = useCallback(() => {
    if (props.hasNextPage) {
      return <LoadingNextFooter />;
    }
    if (props.items.length > 0) {
      return <EndResultsFooter />;
    }
    if (props.items.length === 0) {
      return <NoResultsFooter />;
    }
    return null;
  }, [props.items.length, props.hasNextPage]);

  return (
    <AppFlashList<BoardgameData>
      flatListRef={flatListRef}
      refreshControl={props.refreshControl}
      renderItem={renderItem}
      data={props.items}
      keyExtractor={(item: BoardgameData) => item.gameID}
      renderListHeader={props.listHeader || getListHeader}
      renderListFooter={getListFooter}
      renderItemSeparator={getListSeparator}
      onScrollThreshold={props.onScrollThreshold}
      handleLoadNext={props.handleLoadNext}
      estimatedItemSize={70}
    />
  );
};
