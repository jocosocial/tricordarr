import {useQueryClient} from '@tanstack/react-query';
import * as React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {FezData, UserHeader} from '#src/Structs/ControllerStructs';

interface FezChatDetailsScreenActionsMenuProps {
  fez: FezData;
}

export const FezChatDetailsScreenActionsMenu = ({fez}: FezChatDetailsScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();
  const {data: profilePublicData} = useUserProfileQuery();
  const userFavoriteMutation = useUserFavoriteMutation();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();

  const handleFavoriteAll = React.useCallback(async () => {
    closeMenu();

    if (!fez.members?.participants || !profilePublicData?.header.userID) {
      return;
    }

    // Filter out the current user from participants
    const otherParticipants = fez.members.participants.filter(
      participant => participant.userID !== profilePublicData.header.userID,
    );

    if (otherParticipants.length === 0) {
      setSnackbarPayload({
        message: 'No other participants to favorite',
        messageType: 'info',
      });
      return;
    }

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
      console.error('[FezChatDetailsScreenActionsMenu] Error favoriting users:', error);
    }
  }, [
    fez.members?.participants,
    profilePublicData?.header.userID,
    userFavoriteMutation,
    queryClient,
    setSnackbarPayload,
    closeMenu,
  ]);

  const handleHelp = React.useCallback(() => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.fezChatDetailsHelpScreen);
  }, [commonNavigation, closeMenu]);

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item title={'Favorite All Users'} leadingIcon={AppIcons.favorite} onPress={handleFavoriteAll} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
