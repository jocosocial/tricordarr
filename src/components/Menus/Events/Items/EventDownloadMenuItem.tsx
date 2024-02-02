import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import React from 'react';
import {Linking} from 'react-native';
import {EventData} from '../../../../libraries/Structs/ControllerStructs';
import {useConfig} from '../../../Context/Contexts/ConfigContext';

interface EventDownloadMenuItemProps {
  closeMenu: () => void;
  event: EventData;
}
export const EventDownloadMenuItem = (props: EventDownloadMenuItemProps) => {
  const {appConfig} = useConfig();

  const handleDownload = () => {
    props.closeMenu();
    // The WebView downloads this as a txt file, not honoring its ICS. So we farm it out to Chrome instead.
    Linking.openURL(`${appConfig.serverUrl}/events/${props.event.eventID}/calendarevent.ics`);
  };

  return <Menu.Item title={'Download'} leadingIcon={AppIcons.download} onPress={handleDownload} />;
};
