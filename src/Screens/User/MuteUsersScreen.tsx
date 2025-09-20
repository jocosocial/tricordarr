import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {UserSearchBar} from '#src/Components/Search/UserSearchBar';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {RefreshControl} from 'react-native';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {AppIcons} from '#src/Enums/Icons';
import {ModeratorMuteText, UserMuteText} from '#src/Components/Text/UserRelationsText';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {ItalicText} from '#src/Components/Text/ItalicText';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.muteUsers>;
export const MuteUsersScreen = ({navigation}: Props) => {
  const {hasModerator} = usePrivilege();
  const userMuteMutation = useUserMuteMutation();
  const {data, isFetching, refetch} = useUserMutesQuery();
  const queryClient = useQueryClient();

  const handleUnmuteUser = (userHeader: UserHeader) => {
    userMuteMutation.mutate(
      {
        action: 'unmute',
        userID: userHeader.userID,
      },
      {
        onSuccess: async () => {
          const invalidations = UserHeader.getRelationKeys().map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
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
        onSuccess: async () => {
          const invalidations = UserHeader.getRelationKeys().map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
        },
      },
    );
  };

  if (data === undefined) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={<RefreshControl refreshing={isFetching || userMuteMutation.isLoading} onRefresh={refetch} />}>
        <PaddedContentView>
          <UserMuteText />
          {hasModerator && <ModeratorMuteText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar excludeHeaders={data} onPress={handleMuteUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Muted Users:</Text>
          {data.length === 0 && <ItalicText>You have not muted any users.</ItalicText>}
          {data.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unmute}
              onPress={() =>
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: relatedUserHeader.userID,
                })
              }
              buttonOnPress={handleUnmuteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
