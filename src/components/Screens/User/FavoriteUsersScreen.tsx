import React, {useEffect, useState} from 'react';
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
import {UserFavoriteText} from '../../Text/UserRelationsText';
import {useUserFavoriteMutation} from '../../Queries/Users/UserFavoriteQueries';
import {ItalicText} from '../../Text/ItalicText';

export const FavoriteUsersScreen = () => {
  const {favorites, refetchFavorites, setFavorites} = useUserRelations();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    refetchFavorites().then(() => setRefreshing(false));
  };
  const {hasModerator} = usePrivilege();
  const userFavoriteMutation = useUserFavoriteMutation();

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

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
              onPress={() => Linking.openURL(`tricordarr://user/${relatedUserHeader.userID}`)}
              buttonOnPress={handleUnfavoriteUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
