import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useCallback} from 'react';
import {Divider} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface SeamailFlatListProps {
  fezList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
}

const ListSeparator = () => <Divider bold={true} />;

// With RN 0.72 if pageSize is too small this doesnt trigger onEndReached. Page size bigger, just fine. WTF?
export const SeamailFlatList = ({fezList, refreshControl, onEndReached}: SeamailFlatListProps) => {
  const SeamailListMargin = useCallback(() => {
    if (fezList.length > 0) {
      return ListSeparator();
    }
    return null;
  }, [fezList]);

  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={SeamailListMargin}
      ListFooterComponent={SeamailListMargin}
      onEndReached={onEndReached}
      keyExtractor={(item: FezData) => item.fezID}
      data={fezList}
      renderItem={({item}) => <SeamailListItem fez={item} />}
      onEndReachedThreshold={5}
    />
  );
};
