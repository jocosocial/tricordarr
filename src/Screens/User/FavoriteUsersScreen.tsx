import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {RefreshControl} from 'react-native';
import {Text} from 'react-native-paper';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {ItalicText} from '#src/Components/Text/ItalicText';
import {UserFavoriteText} from '#src/Components/Text/UserRelationsText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
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
  const {appConfig} = useConfig();

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
          <RefreshControl refreshing={isFetching || userFavoriteMutation.isPending} onRefresh={refetch} />
        }>
        <PaddedContentView>
          <UserFavoriteText />
        </PaddedContentView>
        <PaddedContentView>
          <UserMatchSearchBar
            excludeHeaders={data}
            onPress={handleFavoriteUser}
            clearOnPress={true}
            autoSearch={!appConfig.preRegistrationMode}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Favorite Users:</Text>
          {data.length === 0 && <ItalicText>You have not favorited any users.</ItalicText>}
          {data.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unfavorite}
              onPress={() =>
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: relatedUserHeader.userID,
                })
              }
              buttonOnPress={handleUnfavoriteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
