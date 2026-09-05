import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {ShareContentType} from '#src/Libraries/Sharing';

export interface ModeratorShareActionsMenuProps {
  moderateType: ShareContentType;
  moderateID: string | number;
  contentType?: ShareContentType;
  contentID?: string | number;
  contentIcon?: string;
}

/**
 * Header share menu on content moderate screens. Content shares the public link;
 * Moderator View shares a link that opens this moderate screen.
 */
export const ModeratorShareActionsMenu = ({
  moderateType,
  moderateID,
  contentType,
  contentID,
  contentIcon,
}: ModeratorShareActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<MenuAnchor title={'Share'} iconName={AppIcons.share} onPress={openMenu} />}>
      {contentType !== undefined && contentID !== undefined && contentIcon !== undefined && (
        <ShareMenuItem
          title={'Content'}
          leadingIcon={contentIcon}
          contentType={contentType}
          contentID={contentID}
          closeMenu={closeMenu}
        />
      )}
      <ShareMenuItem
        title={'Moderator View'}
        leadingIcon={AppIcons.moderator}
        contentType={moderateType}
        contentID={moderateID}
        closeMenu={closeMenu}
      />
    </AppMenu>
  );
};
