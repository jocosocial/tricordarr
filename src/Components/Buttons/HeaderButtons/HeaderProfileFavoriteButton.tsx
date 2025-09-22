import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {HeaderFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderFavoriteButton';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';

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
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
        },
      },
    );
  };

  return <HeaderFavoriteButton isFavorite={props.profile.isFavorite} onPress={handleFavorite} />;
};
