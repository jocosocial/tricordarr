import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useState} from 'react';
import {Avatar} from 'react-native-paper';

import {ListItem} from '#src/Components/Lists/ListItem';
import {LoadingAvatarView} from '#src/Components/Views/LoadingAvatarView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';

interface FezParticipantFavoriteAllItemProps {
  fez: FezData;
}

export const FezParticipantFavoriteAllItem = ({fez}: FezParticipantFavoriteAllItemProps) => {
  const {currentUserID} = useSession();
  const userFavoriteMutation = useUserFavoriteMutation();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const {styleDefaults, commonStyles} = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteAll = useCallback(async () => {
    if (!fez.members?.participants || !currentUserID) {
      return;
    }

    // Filter out the current user from participants
    const otherParticipants = fez.members.participants.filter(participant => participant.userID !== currentUserID);

    if (otherParticipants.length === 0) {
      setSnackbarPayload({
        message: 'No other participants to favorite',
        messageType: 'info',
      });
      return;
    }

    setIsLoading(true);

    // Favorite all participants in parallel
    const mutations = otherParticipants.map(participant =>
      userFavoriteMutation.mutateAsync({
        userID: participant.userID,
        action: 'favorite',
      }),
    );

    try {
      const results = await Promise.allSettled(mutations);

      // Count successful and failed mutations
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      // Invalidate relation keys after all mutations complete
      const invalidations = UserHeader.getRelationKeys().map(key => {
        return queryClient.invalidateQueries({queryKey: key});
      });
      await Promise.all(invalidations);

      if (failed === 0) {
        setSnackbarPayload({
          message: `Favorited ${successful} user${successful === 1 ? '' : 's'}`,
          messageType: 'success',
        });
      } else if (successful > 0) {
        setSnackbarPayload({
          message: `Favorited ${successful} user${successful === 1 ? '' : 's'}, ${failed} failed`,
          messageType: 'info',
        });
      }
      // If all failed, error messages are already shown by useTokenAuthMutation
    } catch (error) {
      // Error handling is done by useTokenAuthMutation, but we can add additional handling here if needed
      console.error('[FezParticipantFavoriteAllItem] Error favoriting users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fez.members?.participants, currentUserID, userFavoriteMutation, queryClient, setSnackbarPayload]);

  const getAvatar = React.useCallback(() => {
    if (isLoading) {
      return <LoadingAvatarView size={styleDefaults.avatarSize} />;
    }
    return <Avatar.Icon icon={AppIcons.favorite} size={styleDefaults.avatarSize} />;
  }, [isLoading, styleDefaults.avatarSize]);

  return (
    <ListItem
      style={commonStyles.paddingHorizontalSmall}
      title={'Favorite All Users'}
      onPress={handleFavoriteAll}
      left={getAvatar}
    />
  );
};
