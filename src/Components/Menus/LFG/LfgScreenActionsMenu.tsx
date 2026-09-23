import React, {useCallback, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FavoriteMenuItem} from '#src/Components/Menus/Items/FavoriteMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezAlert} from '#src/Hooks/Fez/useFezAlert';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useMenu} from '#src/Hooks/useMenu';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useLFGStackNavigation} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useFezFavoriteMutation} from '#src/Queries/Fez/FezFavoriteMutations';
import {FezData} from '#src/Structs/ControllerStructs';

export const LfgScreenActionsMenu = ({fezData}: {fezData: FezData}) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useLFGStackNavigation();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();
  const {currentUserID} = useSession();
  const {confirmCancel} = useFezAlert(fezData);
  const favoriteMutation = useFezFavoriteMutation();
  const {updateFavorite, invalidateFez} = useFezCacheReducer();
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);

  const isMember = !!fezData.members;
  const isFavorite = !!fezData.members?.isFavorite;
  const isMuted = !!fezData.members?.isMuted;

  /**
   * Toggle the favorite flag on this LFG. Optimistic: flip the cache before the request so the
   * star is already correct by the time the spinner clears, and roll back (plus invalidate) on
   * failure. Swiftarr rejects favoriting a muted chat, hence the disabled state below.
   */
  const handleFavorite = useCallback(() => {
    setFavoriteRefreshing(true);
    const newValue = !isFavorite;
    updateFavorite(fezData.fezID, newValue);
    favoriteMutation.mutate(
      {
        fezID: fezData.fezID,
        action: newValue ? 'favorite' : 'unfavorite',
      },
      {
        onError: () => {
          updateFavorite(fezData.fezID, !newValue);
          invalidateFez(fezData.fezID);
        },
        onSettled: () => {
          setFavoriteRefreshing(false);
          closeMenu();
        },
      },
    );
  }, [isFavorite, fezData.fezID, updateFavorite, favoriteMutation, invalidateFez, closeMenu]);

  const menuAnchor = <Item title={'LFG Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: fezData});
        }}
      />
      <Divider bold={true} />
      {isMember && (
        <FavoriteMenuItem
          onPress={handleFavorite}
          isFavorite={isFavorite}
          refreshing={favoriteRefreshing}
          disabled={isMuted || favoriteRefreshing}
        />
      )}
      {fezData.owner.userID === currentUserID && (
        <Menu.Item
          leadingIcon={AppIcons.cancel}
          title={'Cancel'}
          onPress={() => {
            closeMenu();
            confirmCancel();
          }}
          disabled={fezData.cancelled}
        />
      )}
      <ShareMenuItem contentType={ShareContentType.lfg} contentID={fezData.fezID} closeMenu={closeMenu} />
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.reportScreen, {
            contentType: ReportContentType.fez,
            contentID: fezData.fezID,
          });
        }}
      />
      {hasModerator && (
        <Menu.Item
          leadingIcon={AppIcons.moderator}
          title={'Moderate'}
          onPress={() => {
            pushModerateResource(commonNavigation, 'lfg', fezData.fezID);
            closeMenu();
          }}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          navigation.push(CommonStackComponents.lfgHelpScreen);
          closeMenu();
        }}
      />
    </AppMenu>
  );
};
