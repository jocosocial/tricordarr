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
import {ModeratorMuteText, UserMuteText} from '../../Text/UserRelationsText';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteQueries';

export const MuteUsersScreen = () => {
  const {mutes, refetchMutes, setMutes} = useUserRelations();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    refetchMutes().then(() => setRefreshing(false));
  };
  const {hasModerator} = usePrivilege();
  const userMuteMutation = useUserMuteMutation();

  const handleUnmuteUser = (userHeader: UserHeader) => {
    userMuteMutation.mutate(
      {
        action: 'unmute',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setMutes(mutes.filter(m => m.userID !== userHeader.userID));
        },
      },
    );
  };

  const handleMuteUser = (userHeader: UserHeader) => {
    userMuteMutation.mutate(
      {
        action: 'mute',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setMutes(mutes.concat(userHeader));
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <UserMuteText />
          {hasModerator && <ModeratorMuteText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={mutes} onPress={handleMuteUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Blocked Users:</Text>
          {mutes.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unmute}
              onPress={() => Linking.openURL(`tricordarr://user/${relatedUserHeader.userID}`)}
              buttonOnPress={handleUnmuteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
