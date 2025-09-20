import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../Libraries/Enums/Icons.ts';
import React from 'react';
import {Linking} from 'react-native';
import {EventData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface EventDownloadMenuItemProps {
  closeMenu: () => void;
  event: EventData;
}
export const EventDownloadMenuItem = (props: EventDownloadMenuItemProps) => {
  const {serverUrl} = useSwiftarrQueryClient();

  const handleDownload = () => {
    props.closeMenu();
    // The WebView downloads this as a txt file, not honoring its ICS. So we farm it out to Chrome instead.
    Linking.openURL(`${serverUrl}/events/${props.event.eventID}/calendarevent.ics`);
  };

  return <Menu.Item title={'Download'} leadingIcon={AppIcons.download} onPress={handleDownload} />;
};
