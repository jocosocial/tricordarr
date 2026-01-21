import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserFindSearchBar} from '#src/Components/Search/UserSearchBar/UserFindSearchBar';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {ItalicText} from '#src/Components/Text/ItalicText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.favoriteUsers>;

export const FavoriteUsersScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/favorites'}>
      <FavoriteUsersScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const FavoriteUsersScreenInner = ({navigation}: Props) => {
  const userFavoriteMutation = useUserFavoriteMutation();
  const {data, isFetching, refetch} = useUserFavoritesQuery();
  const queryClient = useQueryClient();
  const {preRegistrationMode} = usePreRegistration();

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

  const handleUnfavoriteUser = (userHeader: UserHeader) => {
    userFavoriteMutation.mutate(
      {
        action: 'unfavorite',
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

  const handleFavoriteUser = (userHeader: UserHeader) => {
    userFavoriteMutation.mutate(
      {
        action: 'favorite',
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
          <AppRefreshControl refreshing={isFetching || userFavoriteMutation.isPending} onRefresh={refetch} />
        }>
        <PaddedContentView>
          <Text>
            Favoriting a user allows them to call you with KrakenTalk™. You will only be able to call them if they
            favorite you.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          {preRegistrationMode ? (
            <UserFindSearchBar excludeHeaders={data} onPress={handleFavoriteUser} clearOnPress={true} />
          ) : (
            <UserMatchSearchBar excludeHeaders={data} onPress={handleFavoriteUser} clearOnPress={true} />
          )}
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Favorite Users:</Text>
          {data.length === 0 && <ItalicText>You have not favorited any users.</ItalicText>}
          {data.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unfavorite}
              onPress={() => {
                if (preRegistrationMode) {
                  return;
                }
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: relatedUserHeader.userID,
                });
              }}
              buttonOnPress={handleUnfavoriteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
