import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {UserSearchBar} from '../../Search/UserSearchBar.tsx';
import {UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {Text} from 'react-native-paper';
import {RefreshControl} from 'react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {UserListItem} from '../../Lists/Items/UserListItem.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries.ts';
import {ModeratorBlockText, UserBlockText} from '../../Text/UserRelationsText.tsx';
import {ItalicText} from '../../Text/ItalicText.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useUserBlockMutation} from '../../Queries/Users/UserBlockMutations.ts';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.blockUsers>;
export const BlockUsersScreen = ({navigation}: Props) => {
  const {hasModerator} = usePrivilege();
  const userBlockMutation = useUserBlockMutation();
  const {data, isFetching, refetch} = useUserBlocksQuery();
  const queryClient = useQueryClient();

  const handleUnblockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'unblock',
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

  const handleBlockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'block',
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
        refreshControl={<RefreshControl refreshing={isFetching || userBlockMutation.isLoading} onRefresh={refetch} />}>
        <PaddedContentView>
          <UserBlockText />
          {hasModerator && <ModeratorBlockText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar excludeHeaders={data} onPress={handleBlockUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Blocked Users:</Text>
          {data.length === 0 && <ItalicText>You have not blocked any users.</ItalicText>}
          {data.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unblock}
              onPress={() =>
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: relatedUserHeader.userID,
                })
              }
              buttonOnPress={handleUnblockUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
