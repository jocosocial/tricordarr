import React from 'react';
import {Menu} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserVCardDownloadMutation} from '#src/Queries/Users/UserVCardMutations';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserVCardDownloadMenuItemProps {
  closeMenu: () => void;
  header: UserHeader;
}

/**
 * Actions-menu item that fetches this user's vCard and presents the download sheet. Disabled in
 * pre-registration mode, since Swiftarr doesn't allow the vCard route then.
 */
export const UserVCardDownloadMenuItem = ({closeMenu, header}: UserVCardDownloadMenuItemProps) => {
  const {openDownloadSheet} = useDownloadSheet();
  const {snackbarTry} = useSnackbar();
  const {preRegistrationMode} = usePreRegistration();
  const {mutateAsync, isPending} = useUserVCardDownloadMutation();

  /**
   * Closes the parent actions menu, fetches the vCard, then presents the download sheet.
   * Awaits mutateAsync rather than passing onSuccess to mutate(): closing the menu unmounts this
   * item, and TanStack drops a mutate() call's callbacks once its component unmounts.
   */
  const handlePress = React.useCallback(async () => {
    closeMenu();
    let vcard: string;
    try {
      vcard = await mutateAsync(header.userID);
    } catch {
      // useTokenAuthMutation already shows the error.
      return;
    }
    openDownloadSheet({
      title: 'Save Contact',
      baseName: header.username,
      mimeType: 'text/vcard',
      contents: vcard,
    });
  }, [closeMenu, header.userID, header.username, mutateAsync, openDownloadSheet]);

  return (
    <Menu.Item
      title={'Save Contact'}
      leadingIcon={AppIcons.download}
      onPress={snackbarTry(handlePress)}
      disabled={preRegistrationMode || isPending}
    />
  );
};
