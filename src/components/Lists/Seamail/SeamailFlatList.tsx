import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React from 'react';
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

const SeamailListHeader = () => {
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  return (
    <View>
      {(hasTwitarrTeam || hasModerator) && (
        <PaddedContentView padTop={true}>
          <SeamailAccountButtons />
        </PaddedContentView>
      )}
      <ListSeparator />
    </View>
  );
};

export const SeamailFlatList = ({fezList, refreshControl, onEndReached}: SeamailFlatListProps) => {
  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={SeamailListHeader}
      ListFooterComponent={ListSeparator}
      onEndReached={onEndReached}
      keyExtractor={(item: FezData) => item.fezID}
      data={fezList}
      renderItem={({item}) => <SeamailListItem fez={item} />}
      onEndReachedThreshold={5}
    />
  );
};
