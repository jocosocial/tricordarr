import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {RefreshControl} from 'react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {UserListItem} from '../../Lists/Items/UserListItem';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ModeratorMuteText, UserMuteText} from '../../Text/UserRelationsText';
import {useUserMuteMutation, useUserMutesQuery} from '../../Queries/Users/UserMuteQueries';
import {ItalicText} from '../../Text/ItalicText';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.muteUsers>;
export const MuteUsersScreen = ({navigation}: Props) => {
  const {mutes, setMutes} = useUserRelations();
  const {hasModerator} = usePrivilege();
  const userMuteMutation = useUserMuteMutation();
  const {isLoading, isRefetching, refetch} = useUserMutesQuery();

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

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isRefetching || userMuteMutation.isLoading} onRefresh={refetch} />}>
        <PaddedContentView>
          <UserMuteText />
          {hasModerator && <ModeratorMuteText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={mutes} onPress={handleMuteUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Muted Users:</Text>
          {mutes.length === 0 && <ItalicText>You have not muted any users.</ItalicText>}
          {mutes.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unmute}
              onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {
                userID: relatedUserHeader.userID,
              })}
              buttonOnPress={handleUnmuteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
