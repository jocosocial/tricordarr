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
  const {appConfig} = useConfig();

  const handlePress = () => {
    const fullURL = `${appConfig.serverUrl}/${contentType}/${contentID}`;

    Clipboard.setString(fullURL);

    if (closeMenu) {
      closeMenu();
    }
  };

  return <Menu.Item title={'Share'} leadingIcon={AppIcons.share} onPress={handlePress} />;
};
