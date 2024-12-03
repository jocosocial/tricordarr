import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {Item} from 'react-navigation-header-buttons';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext.ts';
import {useQueryClient} from '@tanstack/react-query';
import {useUserFavoriteMutation} from '../../Queries/Users/UserFavoriteMutations.ts';

interface HeaderProfileFavoriteButtonProps {
  profile: ProfilePublicData;
}

export const HeaderProfileFavoriteButton = (props: HeaderProfileFavoriteButtonProps) => {
  const favoriteMutation = useUserFavoriteMutation();
  const {favorites, setFavorites} = useUserRelations();
  const queryClient = useQueryClient();

  const handleFavorite = () => {
    if (props.profile.isFavorite) {
      favoriteMutation.mutate(
        {
          userID: props.profile.header.userID,
          action: 'unfavorite',
        },
        {
          onSuccess: async () => {
            setFavorites(favorites.filter(m => m.userID !== props.profile.header.userID));
            await queryClient.invalidateQueries([`/users/${props.profile.header.userID}/profile`]);
          },
        },
      );
    } else {
      favoriteMutation.mutate(
        {
          userID: props.profile.header.userID,
          action: 'favorite',
        },
        {
          onSuccess: async () => {
            setFavorites(favorites.concat([props.profile.header]));
            await queryClient.invalidateQueries([`/users/${props.profile.header.userID}/profile`]);
          },
        },
      );
    }
  };

  return (
    <Item
      iconName={props.profile.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
      title={props.profile.isFavorite ? 'Unfavorite' : 'Favorite'}
      onPress={handleFavorite}
    />
  );
};
