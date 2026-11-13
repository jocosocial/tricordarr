import React, {useCallback, useEffect, useRef} from 'react';
import {FlatList, RefreshControlProps} from 'react-native';

import {AppFlatList} from '#src/Components/Lists/AppFlatList';
import {FezChatListItem} from '#src/Components/Lists/Items/FezChatListItem';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {FezData} from '#src/Structs/ControllerStructs';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  handleLoadNext?: () => void;
  scrollToTopIntent?: number;
}

/**
 * A list of joined Fez chats (Seamail, private events, and LFGs). There are no previous pages.
 */
export const SeamailFlatList = (props: SeamailFlatListProps) => {
  const flatListRef = useRef<FlatList<FezData>>(null);
  const {enableSelection, setEnableSelection, selectedItems} = useSelection();
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({
    data: props.fezList,
    hasNextPage: props.hasNextPage,
  });

  useEffect(() => {
    if (props.scrollToTopIntent) {
      flatListRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [props.scrollToTopIntent]);

  const renderItem = useCallback(
    ({item}: {item: FezData}) => (
      <FezChatListItem
        fez={item}
        enableSelection={enableSelection}
        setEnableSelection={setEnableSelection}
        selected={selectedItems.some(i => i.id === item.fezID)}
      />
    ),
    [enableSelection, setEnableSelection, selectedItems],
  );

  return (
    <AppFlatList<FezData>
      ref={flatListRef}
      refreshControl={props.refreshControl}
      renderItem={renderItem}
      data={props.fezList}
      keyExtractor={(item: FezData) => item.fezID}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      onScrollThreshold={props.onScrollThreshold}
      handleLoadNext={props.handleLoadNext}
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
