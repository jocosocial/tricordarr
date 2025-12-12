import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Menu} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';

interface ShareMenuItemProps {
  contentType: ShareContentType;
  contentID: string | number;
  closeMenu?: () => void;
}

export const ShareMenuItem = ({contentType, contentID, closeMenu}: ShareMenuItemProps) => {
  const {appConfig, oobeCompleted} = useConfig();

  const handlePress = React.useCallback(() => {
    let fullURL = '';
    if (contentType === ShareContentType.siteUI) {
      fullURL = contentID as string;
    } else {
      fullURL = `${appConfig.serverUrl}/${contentType}/${contentID}`;
    }

    Clipboard.setString(fullURL);

    if (closeMenu) {
      closeMenu();
    }
  }, [contentType, contentID, appConfig, closeMenu]);

  /**
   * If the user hasn't finished setup or is in pre-registration mode,
   * don't let them share content.
   */
  if (!oobeCompleted || appConfig.preRegistrationMode) {
    return null;
  }

  return <Menu.Item title={'Share'} leadingIcon={AppIcons.share} onPress={handlePress} />;
};
