import React from 'react';
import {Menu} from 'react-native-paper';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useShareSheet} from '#src/Context/Contexts/ShareSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Libraries/Sharing';

interface ShareMenuItemProps {
  contentType: ShareContentType;
  contentID: string | number;
  closeMenu?: () => void;
}

/**
 * Actions-menu item that presents the share bottom sheet for this content.
 */
export const ShareMenuItem = ({contentType, contentID, closeMenu}: ShareMenuItemProps) => {
  const {oobeCompleted} = useOobe();
  const {openShareSheet} = useShareSheet();
  const {snackbarTry} = useSnackbar();

  /**
   * Closes the parent actions menu, then presents the share sheet for this content.
   */
  const handlePress = React.useCallback(() => {
    closeMenu?.();
    openShareSheet(contentType, contentID);
  }, [closeMenu, contentID, contentType, openShareSheet]);

  /**
   * If the user hasn't finished setup don't let them share content.
   * This used to also disable in pre-registration mode, but I found cases where I
   * wanted to share content from Start.
   */
  return (
    <Menu.Item
      disabled={!oobeCompleted}
      title={'Share'}
      leadingIcon={AppIcons.share}
      onPress={snackbarTry(handlePress)}
    />
  );
};
