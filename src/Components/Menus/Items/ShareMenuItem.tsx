import React from 'react';
import {Menu} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useShareSheet} from '#src/Context/Contexts/ShareSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {shareLinkToApps} from '#src/Libraries/ShareToApps';
import {getShareLink, ShareContentType} from '#src/Libraries/Sharing';

interface ShareMenuItemProps {
  contentType: ShareContentType;
  contentID: string | number;
  contentText?: string;
  closeMenu?: () => void;
  title?: string;
  leadingIcon?: string;
}

/**
 * Actions-menu item that shares this content. A press shares to other apps and a long press opens
 * the share bottom sheet, unless the Share Opens Sheet setting makes a press open the sheet instead.
 * contentText, when provided, is combined with the share link when sharing to other apps.
 */
export const ShareMenuItem = ({
  contentType,
  contentID,
  contentText,
  closeMenu,
  title = 'Share',
  leadingIcon = AppIcons.share,
}: ShareMenuItemProps) => {
  const {oobeCompleted} = useOobe();
  const {openShareSheet} = useShareSheet();
  const {snackbarTry} = useSnackbar();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {shareOpensSheet} = appConfig.userPreferences;

  /**
   * Closes the parent actions menu, then presents the share sheet for this content.
   */
  const handleOpenSheet = React.useCallback(() => {
    closeMenu?.();
    openShareSheet(contentType, contentID, contentText);
  }, [closeMenu, contentID, contentText, contentType, openShareSheet]);

  /**
   * Closes the parent actions menu, then shares the web link straight to other apps.
   */
  const handleShare = React.useCallback(async () => {
    closeMenu?.();
    await shareLinkToApps(getShareLink({serverUrl, contentType, contentID}), contentText);
  }, [closeMenu, contentID, contentText, contentType, serverUrl]);

  /**
   * If the user hasn't finished setup don't let them share content.
   * This used to also disable in pre-registration mode, but I found cases where I
   * wanted to share content from Start.
   */
  return (
    <Menu.Item
      disabled={!oobeCompleted}
      title={title}
      leadingIcon={leadingIcon}
      onPress={snackbarTry(shareOpensSheet ? handleOpenSheet : handleShare)}
      onLongPress={shareOpensSheet ? undefined : snackbarTry(handleOpenSheet)}
    />
  );
};
