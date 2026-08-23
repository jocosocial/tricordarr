import {useQueryClient} from '@tanstack/react-query';
import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {alertBlock, alertMute} from '#src/Libraries/Alerts/UserAlerts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
  isMuted: boolean;
  isBlocked: boolean;
}

export const UserProfileScreenActionsMenu = ({profile, isMuted, isBlocked}: UserProfileActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const {hasAccountManager} = useRoles();
  const commonNavigation = useCommonStack();
  const queryClient = useQueryClient();

  const handleModerate = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.siteUIScreen, {
      resource: 'userprofile',
      id: profile.header.userID,
      moderate: true,
    });
  };
  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.users,
      contentID: profile.header.userID,
    });
  };
  const handleRegCode = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userRegCodeScreen, {
      userID: profile.header.userID,
    });
  };
  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userProfilesHelpScreen);
  };

  const invalidateRelations = () => {
    const invalidations = UserHeader.getRelationKeys().map(key => {
      return queryClient.invalidateQueries({queryKey: key});
    });
    Promise.all(invalidations);
  };

  const handleBlock = () => {
    if (isBlocked) {
      blockMutation.mutate(
        {userID: profile.header.userID, action: 'unblock'},
        {
          onSuccess: invalidateRelations,
          onSettled: closeMenu,
        },
      );
      return;
    }
    alertBlock(
      hasModerator,
      () => {
        blockMutation.mutate(
          {userID: profile.header.userID, action: 'block'},
          {
            onSuccess: invalidateRelations,
            onSettled: closeMenu,
          },
        );
      },
      closeMenu,
    );
  };

  const handleMute = () => {
    if (isMuted) {
      muteMutation.mutate(
        {userID: profile.header.userID, action: 'unmute'},
        {
          onSuccess: invalidateRelations,
          onSettled: closeMenu,
        },
      );
      return;
    }
    alertMute(
      hasModerator,
      () => {
        muteMutation.mutate(
          {userID: profile.header.userID, action: 'mute'},
          {
            onSuccess: invalidateRelations,
            onSettled: closeMenu,
          },
        );
      },
      closeMenu,
    );
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ShareMenuItem contentType={ShareContentType.user} contentID={profile.header.userID} closeMenu={closeMenu} />
      <Divider bold={true} />
      <Menu.Item
        leadingIcon={isBlocked ? AppIcons.unblock : AppIcons.block}
        title={isBlocked ? 'Unblock' : 'Block'}
        onPress={handleBlock}
      />
      <Menu.Item
        leadingIcon={isMuted ? AppIcons.unmute : AppIcons.mute}
        title={isMuted ? 'Unmute' : 'Mute'}
        onPress={handleMute}
      />
      <Menu.Item leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
      {(hasModerator || hasTwitarrTeam || hasAccountManager) && (
        <>
          <Divider bold={true} />
          {hasModerator && <Menu.Item leadingIcon={AppIcons.moderator} title={'Moderate'} onPress={handleModerate} />}
          {(hasTwitarrTeam || hasAccountManager) && (
            <Menu.Item leadingIcon={AppIcons.registrationCode} title={'Registration'} onPress={handleRegCode} />
          )}
        </>
      )}
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </AppMenu>
  );
};
