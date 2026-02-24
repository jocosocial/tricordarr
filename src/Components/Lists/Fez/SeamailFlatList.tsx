import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef} from 'react';
import {RefreshControlProps} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {SeamailListItem} from '#src/Components/Lists/Items/SeamailListItem';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
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
 * A list of Seamail conversations. There are no previous pages.
 */
export const SeamailFlatList = (props: SeamailFlatListProps) => {
  const flatListRef = useRef<FlashListRef<FezData>>(null);
  const {enableSelection, setEnableSelection, selectedItems} = useSelection();

  useEffect(() => {
    if (props.scrollToTopIntent) {
      flatListRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [props.scrollToTopIntent]);

  const getListSeparator = useCallback(() => {
    if (props.fezList.length > 0) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [props.fezList]);

  const renderItem = useCallback(
    ({item}: {item: FezData}) => (
      <SeamailListItem
        key={`${item.fezID}-${item.members?.isMuted ?? false}`}
        fez={item}
        enableSelection={enableSelection}
        setEnableSelection={setEnableSelection}
        selected={selectedItems.some(i => i.id === item.fezID)}
      />
    ),
    [enableSelection, setEnableSelection, selectedItems],
  );

  const getListHeader = useCallback(() => {
    if (props.fezList.length > 0) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [props.fezList.length]);

  const getListFooter = useCallback(() => {
    if (props.fezList.length > 0) {
      return <EndResultsFooter />;
    }
    if (props.fezList.length === 0) {
      return <NoResultsFooter />;
    }
    return null;
  }, [props.fezList.length]);

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
    />
  );
};
