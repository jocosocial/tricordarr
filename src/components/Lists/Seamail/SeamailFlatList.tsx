import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useCallback, useRef} from 'react';
import {Divider} from 'react-native-paper';
import {ConversationFlatList} from '../ConversationFlatList.tsx';
import {EndResultsFooter} from '../Footers/EndResultsFooter.tsx';
import {NoResultsView} from '../../Views/Static/NoResultsView.tsx';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onScrollThreshold?: (condition: boolean) => void;
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
    return <NoResultsView />;
  }, [props.fezList.length]);

  const getListFooter = useCallback(() => {
    if (props.fezList.length > 0) {
      return (
        <View>
          <Divider bold={true} />
          <EndResultsFooter />
        </View>
      );
    }
    return null;
  }, [props.fezList.length]);

  return (
    <ConversationFlatList
      flatListRef={flatListRef}
      refreshControl={props.refreshControl}
      renderItem={renderItem}
      data={props.fezList}
      keyExtractor={(item: FezData) => item.fezID}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      onScrollThreshold={props.onScrollThreshold}
    />
  );
};
