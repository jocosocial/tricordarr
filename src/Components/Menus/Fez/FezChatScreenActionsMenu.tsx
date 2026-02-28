import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {MuteMenuItem} from '#src/Components/Menus/Items/MuteMenuItem';
import {PostAsModeratorMenuItem} from '#src/Components/Menus/Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '#src/Components/Menus/Items/PostAsTwitarrTeamMenuItem';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezData} from '#src/Hooks/useFezData';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';

interface FezChatActionsMenuProps {
  fezID: string;
  onRefresh: () => void;
}

export const FezChatScreenActionsMenu = ({fezID, onRefresh}: FezChatActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {isChatEditable, isParticipant, isMuted} = useFezData({fezID: fezID});
  const navigation = useCommonStack();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const commonNavigation = useCommonStack();
  const {updateMute} = useFezCacheReducer();

  const detailsAction = () => {
    navigation.push(CommonStackComponents.fezChatDetailsScreen, {fezID: fezID});
    closeMenu();
  };

  const editAction = () => {
    navigation.push(CommonStackComponents.seamailEditScreen, {fezID: fezID});
    closeMenu();
  };

  const handleMute = () => {
    const newMuted = !isMuted;
    muteMutation.mutate(
      {
        action: isMuted ? 'unmute' : 'mute',
        fezID: fezID,
      },
      {
        onSuccess: () => {
          updateMute(fezID, newMuted);
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
      <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />
      {isChatEditable && <Menu.Item leadingIcon={AppIcons.edit} onPress={editAction} title={'Edit'} />}
      {isParticipant && <MuteMenuItem onPress={handleMute} isMuted={isMuted} />}
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
          commonNavigation.push(CommonStackComponents.fezChatHelpScreen);
        }}
      />
    </AppMenu>
  );
};
