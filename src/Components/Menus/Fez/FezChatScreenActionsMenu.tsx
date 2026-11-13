import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FavoriteMenuItem} from '#src/Components/Menus/Items/FavoriteMenuItem';
import {MuteMenuItem} from '#src/Components/Menus/Items/MuteMenuItem';
import {PostAsModeratorMenuItem} from '#src/Components/Menus/Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '#src/Components/Menus/Items/PostAsTwitarrTeamMenuItem';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useFezData} from '#src/Hooks/Fez/useFezData';
import {useMenu} from '#src/Hooks/useMenu';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezFavoriteMutation} from '#src/Queries/Fez/FezFavoriteMutations';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';

interface FezChatActionsMenuProps {
  fezID: string;
  onRefresh: () => void;
  asModerator: boolean;
  asTwitarrTeam: boolean;
  toggleModerator: () => void;
  toggleTwitarrTeam: () => void;
}

export const FezChatScreenActionsMenu = ({
  fezID,
  onRefresh,
  asModerator,
  asTwitarrTeam,
  toggleModerator,
  toggleTwitarrTeam,
}: FezChatActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {isChatEditable, isParticipant, isMuted, isFavorite} = useFezData({fezID: fezID});
  const navigation = useCommonStack();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const favoriteMutation = useFezFavoriteMutation();
  const commonNavigation = useCommonStack();
  const [muteRefreshing, setMuteRefreshing] = React.useState(false);
  const [favoriteRefreshing, setFavoriteRefreshing] = React.useState(false);

  const detailsAction = () => {
    navigation.push(CommonStackComponents.fezChatDetailsScreen, {fezID: fezID});
    closeMenu();
  };

  const editAction = () => {
    navigation.push(CommonStackComponents.seamailEditScreen, {fezID: fezID});
    closeMenu();
  };

  const handleMute = () => {
    setMuteRefreshing(true);
    const newMuted = !isMuted;
    // The mutation hook flips the cache optimistically and rolls back on error.
    muteMutation.mutate(
      {
        action: newMuted ? 'mute' : 'unmute',
        fezID: fezID,
      },
      {
        onSettled: () => {
          setMuteRefreshing(false);
          closeMenu();
        },
      },
    );
  };

  /**
   * Toggle the favorite flag on this chat. The mutation hook flips the cache before the request and
   * rolls back on failure. Swiftarr rejects favoriting a muted chat, hence the disabled
   * state below.
   */
  const handleFavorite = () => {
    setFavoriteRefreshing(true);
    const newFavorite = !isFavorite;
    favoriteMutation.mutate(
      {
        action: newFavorite ? 'favorite' : 'unfavorite',
        fezID: fezID,
      },
      {
        onSettled: () => {
          setFavoriteRefreshing(false);
          closeMenu();
        },
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
      {isParticipant && (
        <>
          <FavoriteMenuItem
            onPress={handleFavorite}
            isFavorite={isFavorite}
            refreshing={favoriteRefreshing}
            disabled={isMuted || favoriteRefreshing}
          />
          <MuteMenuItem
            onPress={handleMute}
            isMuted={isMuted}
            refreshing={muteRefreshing}
            disabled={isFavorite || muteRefreshing}
          />
        </>
      )}
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          <PostAsModeratorMenuItem closeMenu={closeMenu} active={asModerator} onPress={toggleModerator} />
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} active={asTwitarrTeam} onPress={toggleTwitarrTeam} />
          {hasModerator && (
            <Menu.Item
              leadingIcon={AppIcons.moderator}
              title={'Moderate'}
              onPress={() => {
                closeMenu();
                pushModerateResource(navigation, 'lfg', fezID);
              }}
            />
          )}
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
