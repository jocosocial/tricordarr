import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useCallback, useRef} from 'react';
import {Divider} from 'react-native-paper';
import {EndResultsFooter} from '../Footers/EndResultsFooter.tsx';
import {NoResultsFooter} from '../Footers/NoResultsFooter.tsx';
import {AppFlatList} from '../AppFlatList.tsx';

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
  const flatListRef = useRef<FlatList<FezData>>(null);

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
    <AppFlatList
      flatListRef={flatListRef}
      refreshControl={props.refreshControl}
      renderItem={renderItem}
      data={props.fezList}
      keyExtractor={(item: FezData) => item.fezID}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      onScrollThreshold={props.onScrollThreshold}
      handleLoadNext={props.handleLoadNext}
      hasNextPage={props.hasNextPage}
      hasPreviousPage={props.hasPreviousPage}
      handleLoadPrevious={props.handleLoadPrevious}
    />
  );
};
