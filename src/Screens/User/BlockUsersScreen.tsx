import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {RefreshControl} from 'react-native';
import {Text} from 'react-native-paper';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {ItalicText} from '#src/Components/Text/ItalicText';
import {ModeratorBlockText, UserBlockText} from '#src/Components/Text/UserRelationsText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.blockUsers>;

export const BlockUsersScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/blocks'}>
        <BlockUsersScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const BlockUsersScreenInner = ({navigation}: Props) => {
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
            return queryClient.invalidateQueries({queryKey: key});
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
            return queryClient.invalidateQueries({queryKey: key});
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
        refreshControl={<RefreshControl refreshing={isFetching || userBlockMutation.isPending} onRefresh={refetch} />}>
        <PaddedContentView>
          <UserBlockText />
          {hasModerator && <ModeratorBlockText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserMatchSearchBar excludeHeaders={data} onPress={handleBlockUser} />
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
