import {FlatList, RefreshControlProps} from 'react-native';
import React, {useCallback, useRef} from 'react';
import {Divider} from 'react-native-paper';
import {AppFlatList} from './AppFlatList.tsx';
import {EndResultsFooter} from './Footers/EndResultsFooter.tsx';
import {NoResultsHeader} from './Headers/NoResultsHeader.tsx';
import {BoardgameListItem} from './Items/BoardgameListItem.tsx';
import {BoardgameData} from '../../libraries/Structs/ControllerStructs.tsx';
import {LoadingNextFooter} from './Footers/LoadingNextFooter.tsx';

interface BoardgameFlatListProps {
  items: BoardgameData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
}

export const BoardgameFlatList = (props: BoardgameFlatListProps) => {
  const flatListRef = useRef<FlatList<BoardgameData>>(null);

  const getListSeparator = useCallback(() => {
    return <Divider bold={true} />;
  }, []);

  const renderItem = ({item}: {item: BoardgameData}) => <BoardgameListItem boardgame={item} />;

  const getListHeader = useCallback(() => {
    if (props.items.length > 0) {
      return <Divider bold={true} />;
    }
    return <NoResultsHeader />;
  }, [props.items.length]);

  const getListFooter = useCallback(() => {
    if (props.hasNextPage) {
      return <LoadingNextFooter />;
    }
    if (props.items.length > 0) {
      return <EndResultsFooter />;
    }
    return null;
  }, [props.items.length, props.hasNextPage]);

  return (
    <AppFlatList
      flatListRef={flatListRef}
      refreshControl={props.refreshControl}
      renderItem={renderItem}
      data={props.items}
      keyExtractor={(item: BoardgameData) => item.gameID}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      onScrollThreshold={props.onScrollThreshold}
      hasPreviousPage={props.hasPreviousPage}
      handleLoadPrevious={props.handleLoadPrevious}
      hasNextPage={props.hasNextPage}
      handleLoadNext={props.handleLoadNext}
    />
  );
};
