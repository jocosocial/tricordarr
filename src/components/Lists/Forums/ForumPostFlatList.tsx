import {FezData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React from 'react';
import {Divider, Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
  onStartReached?: ((info: {distanceFromStart: number}) => void) | null | undefined;
}

const ListSeparator = () => <Divider bold={true} />;

// const SeamailListHeader = () => {
//   const {hasTwitarrTeam, hasModerator} = usePrivilege();
//   return (
//     <View>
//       {(hasTwitarrTeam || hasModerator) && (
//         <PaddedContentView padTop={true}>
//           <SeamailAccountButtons />
//         </PaddedContentView>
//       )}
//       <ListSeparator />
//     </View>
//   );
// };

export const ForumPostFlatList = ({postList, refreshControl, onEndReached, onStartReached}: ForumPostFlatListProps) => {
  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ListSeparator}
      // ListHeaderComponent={SeamailListHeader}
      ListFooterComponent={ListSeparator}
      onEndReached={onEndReached}
      onStartReached={onStartReached}
      data={postList}
      renderItem={({item}) => <Text>{item.text}</Text>}
    />
  );
};
