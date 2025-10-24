import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useRef} from 'react';
import {RefreshControlProps} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {SeamailListItem} from '#src/Components/Lists/Items/SeamailListItem';
import {FezData} from '#src/Structs/ControllerStructs';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
}

export const SeamailFlatList = (props: SeamailFlatListProps) => {
  const flatListRef = useRef<FlashListRef<FezData>>(null);

  const getListSeparator = useCallback(() => {
    if (props.fezList.length > 0) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [props.fezList]);

  const renderItem = ({item}: {item: FezData}) => <SeamailListItem fez={item} />;

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
    <AppFlashList
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
