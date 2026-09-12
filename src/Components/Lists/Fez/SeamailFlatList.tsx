import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
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
  const flatListRef = useRef<FlashListRef<FezData>>(null);
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
        // I don't remember why we needed the mute state in the key.
        // I have a suspicion it was with all the panel background crap
        // that boiled down to having the wrong backgroundColor set.
        // Also isn't this what keyExtractor is for?
        // key={`${item.fezID}-${item.members?.isMuted ?? false}`}
        // key={item.fezID}
        fez={item}
        enableSelection={enableSelection}
        setEnableSelection={setEnableSelection}
        selected={selectedItems.some(i => i.id === item.fezID)}
      />
    ),
    [enableSelection, setEnableSelection, selectedItems],
  );

  return (
    <AppFlashList<FezData>
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
      // This is because FlashListV2 uses the first item for some internal anchoring.
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
