import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {shareContentTypeLabels, ShareContentType} from '#src/Libraries/Sharing';

export interface ModeratorShareActionsMenuProps {
  moderateType: ShareContentType;
  moderateID: string | number;
  contentType?: ShareContentType;
  contentID?: string | number;
  contentIcon?: string;
}

/**
 * Header share menu on content moderate screens. The public-link item is labeled
 * with the content type; Moderator View shares a link that opens this moderate screen.
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
          title={shareContentTypeLabels[contentType]}
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
