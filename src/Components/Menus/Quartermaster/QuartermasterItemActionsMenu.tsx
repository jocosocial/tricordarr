import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useQuartermasterDelete} from '#src/Hooks/Quartermaster/useQuartermasterDelete';
import {useQuartermasterViewer} from '#src/Hooks/Quartermaster/useQuartermasterViewer';
import {useMenu} from '#src/Hooks/useMenu';
import {canModifyQuartermasterItem, isOwnQuartermasterItem} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

interface QuartermasterItemActionsMenuProps {
  item: QuartermasterData;
}

/**
 * Three-dots menu on the Quartermastarr item screen: Share, Report (not your own item),
 * Delete (owner or moderator), and Moderate (moderators).
 */
export const QuartermasterItemActionsMenu = ({item}: QuartermasterItemActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();
  const viewer = useQuartermasterViewer();
  const {confirmAndDelete, isPending: isDeleting} = useQuartermasterDelete();

  const isOwn = isOwnQuartermasterItem(item, viewer);
  const canDelete = canModifyQuartermasterItem(item, viewer);

  const handleReport = () => {
    navigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.quartermasterItem,
      contentID: item.itemID,
    });
  };

  /**
   * Confirms and deletes. The screen is dismissed only after the server agrees; the menu closes
   * whether or not it does.
   */
  const handleDelete = () => {
    confirmAndDelete(item, {onSuccess: () => navigation.goBack(), onSettled: closeMenu});
  };

  const menuAnchor = <Item title={'Item Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ShareMenuItem contentType={ShareContentType.quartermaster} contentID={item.itemID} closeMenu={closeMenu} />
      {!isOwn && <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />}
      {canDelete && (
        <Menu.Item
          dense={false}
          leadingIcon={AppIcons.delete}
          title={'Delete'}
          disabled={isDeleting}
          onPress={handleDelete}
        />
      )}
      {viewer.hasModerator && (
        <>
          <Divider bold={true} />
          <ModerateMenuItem
            closeMenu={closeMenu}
            resourceID={item.itemID}
            resource={'quartermaster'}
            navigation={navigation}
          />
        </>
      )}
    </AppMenu>
  );
};
