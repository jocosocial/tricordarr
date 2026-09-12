import React from 'react';
import {Menu} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserVCardDownloadMutation} from '#src/Queries/Users/UserVCardMutations';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserVCardDownloadMenuItemProps {
  closeMenu: () => void;
  header: UserHeader;
}

/**
 * Actions-menu item that fetches this user's vCard and presents the download sheet.
 */
export const UserVCardDownloadMenuItem = ({closeMenu, header}: UserVCardDownloadMenuItemProps) => {
  const {openDownloadSheet} = useDownloadSheet();
  const {snackbarTry} = useSnackbar();
  const {mutate, isPending} = useUserVCardDownloadMutation();

  /**
   * Closes the parent actions menu, fetches the vCard, then presents the download sheet.
   */
  const handlePress = React.useCallback(() => {
    closeMenu();
    mutate(header.userID, {
      onSuccess: vcard => {
        openDownloadSheet({
          title: 'Save Contact',
          baseName: header.username,
          mimeType: 'text/vcard',
          contents: vcard,
        });
      },
    });
  }, [closeMenu, header.userID, header.username, mutate, openDownloadSheet]);

  return (
    <Menu.Item
      title={'Save Contact'}
      leadingIcon={AppIcons.download}
      onPress={snackbarTry(handlePress)}
      disabled={isPending}
    />
  );
};
