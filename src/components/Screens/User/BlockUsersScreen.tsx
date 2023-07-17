import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {Linking, RefreshControl} from 'react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {UserListItem} from '../../Lists/Items/UserListItem';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useUserBlockMutation} from '../../Queries/Users/UserBlockQueries';
import {ModeratorBlockText, UserBlockText} from '../../Text/UserRelationsText';
import {ItalicText} from '../../Text/ItalicText';

export const BlockUsersScreen = () => {
  const {blocks, refetchBlocks, setBlocks} = useUserRelations();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    refetchBlocks().then(() => setRefreshing(false));
  };
  const {hasModerator} = usePrivilege();
  const userBlockMutation = useUserBlockMutation();

  const handleUnblockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'unblock',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setBlocks(blocks.filter(m => m.userID !== userHeader.userID));
        },
      },
    );
  };

  const handleBlockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'block',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setBlocks(blocks.concat(userHeader));
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <UserBlockText />
          {hasModerator && <ModeratorBlockText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={blocks} onPress={handleBlockUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Blocked Users:</Text>
          {blocks.length === 0 && <ItalicText>You have not muted any users.</ItalicText>}
          {blocks.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unblock}
              onPress={() => Linking.openURL(`tricordarr://user/${relatedUserHeader.userID}`)}
              buttonOnPress={handleUnblockUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
