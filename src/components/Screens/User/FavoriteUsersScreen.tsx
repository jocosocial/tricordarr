import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {RefreshControl} from 'react-native';
import {UserListItem} from '../../Lists/Items/UserListItem';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {UserFavoriteText} from '../../Text/UserRelationsText';
import {useUserFavoriteMutation, useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries';
import {ItalicText} from '../../Text/ItalicText';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStackNavigator.tsx';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.favoriteUsers>;
export const FavoriteUsersScreen = ({navigation}: Props) => {
  const {favorites, setFavorites} = useUserRelations();
  const userFavoriteMutation = useUserFavoriteMutation();
  const {isLoading, isRefetching, refetch} = useUserFavoritesQuery();

  const handleUnfavoriteUser = (userHeader: UserHeader) => {
    userFavoriteMutation.mutate(
      {
        action: 'unfavorite',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setFavorites(favorites.filter(m => m.userID !== userHeader.userID));
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
        onSuccess: () => {
          setFavorites(favorites.concat(userHeader));
        },
      },
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isRefetching || userFavoriteMutation.isLoading} onRefresh={refetch} />}>
        <PaddedContentView>
          <UserFavoriteText />
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={favorites} onPress={handleFavoriteUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Favorite Users:</Text>
          {favorites.length === 0 && <ItalicText>You have not favorited any users.</ItalicText>}
          {favorites.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unfavorite}
              onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {
                userID: relatedUserHeader.userID,
              })}
              buttonOnPress={handleUnfavoriteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
