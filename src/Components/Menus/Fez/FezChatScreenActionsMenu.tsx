import {useQueryClient} from '@tanstack/react-query';
import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {PostAsModeratorMenuItem} from '#src/Components/Menus/Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '#src/Components/Menus/Items/PostAsTwitarrTeamMenuItem';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezChatActionsMenuProps {
  fez: FezData;
  enableDetails?: boolean;
  onRefresh: () => void;
}

export const FezChatScreenActionsMenu = ({fez, enableDetails = true, onRefresh}: FezChatActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const queryClient = useQueryClient();
  const {data: profilePublicData} = useUserProfileQuery();

  const detailsAction = () => {
    navigation.push(CommonStackComponents.fezChatDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  const editAction = () => {
    navigation.push(CommonStackComponents.seamailEditScreen, {fezID: fez.fezID});
    closeMenu();
  };

  const isSeamail = FezType.isSeamailType(fez.fezType);
  const isOwner = profilePublicData?.header.userID === fez.owner.userID;
  const showEdit = isSeamail && isOwner;

  const handleMute = () => {
    if (!fez.members) {
      return;
    }
    const action = fez.members.isMuted ? 'unmute' : 'mute';
    muteMutation.mutate(
      {
        action: action,
        fezID: fez.fezID,
      },
      {
        onSuccess: async () => {
          const invalidations = FezData.getCacheKeys(fez.fezID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
        },
        onSettled: () => closeMenu(),
      },
    );
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />
      <Divider bold={true} />
      {enableDetails && <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />}
      {showEdit && <Menu.Item leadingIcon={AppIcons.edit} onPress={editAction} title={'Edit'} />}
      {fez.members && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.mute}
            onPress={handleMute}
            title={'Mute'}
            style={fez.members.isMuted ? commonStyles.surfaceVariant : undefined}
          />
        </>
      )}
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          <PostAsModeratorMenuItem closeMenu={closeMenu} />
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          const helpRoute = FezType.getHelpRoute(fez.fezType);
          if (helpRoute) {
            commonNavigation.push(helpRoute);
          }
        }}
      />
    </AppMenu>
  );
};
