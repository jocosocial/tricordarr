import React from 'react';
import {Linking} from 'react-native';
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

  const getFullURL = React.useCallback(() => {
    let fullURL = '';
    if (contentType === ShareContentType.siteUI) {
      fullURL = contentID as string;
    } else {
      fullURL = `${serverUrl}/${contentType}/${contentID}`;
    }
    return fullURL;
  }, [contentType, contentID, serverUrl]);

  const handlePress = React.useCallback(() => {
    setString(getFullURL());

    if (closeMenu) {
      closeMenu();
    }
  }, [getFullURL, closeMenu, setString]);

  const handleLongPress = React.useCallback(() => {
    Linking.openURL(getFullURL());
  }, [getFullURL]);

  /**
   * If the user hasn't finished setup or is in pre-registration mode,
   * don't let them share content.
   */
  return (
    <Menu.Item
      disabled={!oobeCompleted || preRegistrationMode}
      title={'Share'}
      leadingIcon={AppIcons.share}
      onPress={handlePress}
      onLongPress={handleLongPress}
    />
  );
};
