import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {ItalicText} from '#src/Components/Text/ItalicText';
import {ModeratorMuteText, UserMuteText} from '#src/Components/Text/UserRelationsText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.muteUsers>;

export const MuteUsersScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.userProfileHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/blocks'}>
        <MuteUsersScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const MuteUsersScreenInner = ({navigation}: Props) => {
  const {hasModerator} = usePrivilege();
  const userMuteMutation = useUserMuteMutation();
  const {data, isFetching, refetch} = useUserMutesQuery();
  const queryClient = useQueryClient();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.userDirectoryHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const handleUnmuteUser = (userHeader: UserHeader) => {
    userMuteMutation.mutate(
      {
        action: 'unmute',
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

  const handleMuteUser = (userHeader: UserHeader) => {
    userMuteMutation.mutate(
      {
        action: 'mute',
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
        refreshControl={
          <AppRefreshControl refreshing={isFetching || userMuteMutation.isPending} onRefresh={refetch} />
        }>
        <PaddedContentView>
          <UserMuteText />
          {hasModerator && <ModeratorMuteText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserMatchSearchBar excludeHeaders={data} onPress={handleMuteUser} clearOnPress={true} />
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
