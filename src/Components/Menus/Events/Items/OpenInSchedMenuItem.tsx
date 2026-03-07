import React, {useCallback} from 'react';
import {Linking} from 'react-native';
import {Menu} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('OpenInSchedMenuItem.tsx');

interface OpenInSchedMenuItemProps {
  closeMenu: () => void;
  eventUid: string;
}

export const OpenInSchedMenuItem = (props: OpenInSchedMenuItemProps) => {
  const {appConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();

  const handlePress = useCallback(() => {
    props.closeMenu();
    Linking.openURL(`${appConfig.schedBaseUrl}/event/${props.eventUid}`).catch(error => {
      logger.error('Failed to open Sched event URL in browser.', error);
      setSnackbarPayload({message: 'Unable to open Sched in your browser.', messageType: 'error'});
    });
  }, [appConfig.schedBaseUrl, props, setSnackbarPayload]);

  if (!appConfig.schedBaseUrl) {
    return null;
  }

  return <Menu.Item title={'Open in Sched'} leadingIcon={AppIcons.schedOpen} onPress={handlePress} />;
};
