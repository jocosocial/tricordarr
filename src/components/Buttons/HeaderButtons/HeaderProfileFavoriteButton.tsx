import React from 'react';
import {ProfilePublicData, UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useUserFavoriteMutation} from '../../Queries/Users/UserFavoriteMutations.ts';
import {HeaderFavoriteButton} from './HeaderFavoriteButton.tsx';

interface HeaderProfileFavoriteButtonProps {
  profile: ProfilePublicData;
}

export const HeaderProfileFavoriteButton = (props: HeaderProfileFavoriteButtonProps) => {
  const favoriteMutation = useUserFavoriteMutation();
  const queryClient = useQueryClient();

  const handleFavorite = () => {
    favoriteMutation.mutate(
      {
        userID: props.profile.header.userID,
        action: props.profile.isFavorite ? 'unfavorite' : 'favorite',
      },
      {
        onSuccess: async () => {
          const invalidations = UserHeader.getRelationKeys(props.profile.header).map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
        },
      },
    );
  };

  return <HeaderFavoriteButton isFavorite={props.profile.isFavorite} onPress={handleFavorite} />;
};
