import React from 'react';
import {Menu} from 'react-native-paper';

import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useClipboard} from '#src/Hooks/useClipboard';

interface ShareMenuItemProps {
  contentType: ShareContentType;
  contentID: string | number;
  closeMenu?: () => void;
}

export const ShareMenuItem = ({contentType, contentID, closeMenu}: ShareMenuItemProps) => {
  const {oobeCompleted} = useOobe();
  const {preRegistrationMode} = usePreRegistration();
  const {serverUrl} = useSwiftarrQueryClient();
  const {setString} = useClipboard();

  const handlePress = React.useCallback(() => {
    let fullURL = '';
    if (contentType === ShareContentType.siteUI) {
      fullURL = contentID as string;
    } else {
      fullURL = `${serverUrl}/${contentType}/${contentID}`;
    }

    setString(fullURL);

    if (closeMenu) {
      closeMenu();
    }
  }, [contentType, contentID, serverUrl, closeMenu, setString]);

  /**
   * If the user hasn't finished setup or is in pre-registration mode,
   * don't let them share content.
   */
  if (!oobeCompleted || preRegistrationMode) {
    return null;
  }

  return <Menu.Item title={'Share'} leadingIcon={AppIcons.share} onPress={handlePress} />;
};
