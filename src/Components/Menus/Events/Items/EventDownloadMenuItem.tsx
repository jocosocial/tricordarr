import React from 'react';
import {Menu} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventIcsDownloadMutation} from '#src/Queries/Events/EventIcsMutations';
import {EventData} from '#src/Structs/ControllerStructs';

interface EventDownloadMenuItemProps {
  closeMenu: () => void;
  event: EventData;
}

/**
 * Basename matching Swiftarr's Content-Disposition: quotes stripped from the event title.
 */
const getEventIcsBaseName = (title: string): string => {
  return title.replace(/"/g, '').trim() || 'calendarevent';
};

/**
 * Actions-menu item that fetches this event's ICS and presents the download sheet.
 */
export const EventDownloadMenuItem = ({closeMenu, event}: EventDownloadMenuItemProps) => {
  const {openDownloadSheet} = useDownloadSheet();
  const {snackbarTry} = useSnackbar();
  const {mutate, isPending} = useEventIcsDownloadMutation();

  /**
   * Closes the parent actions menu, fetches the ICS, then presents the download sheet.
   */
  const handlePress = React.useCallback(() => {
    closeMenu();
    mutate(event.eventID, {
      onSuccess: ics => {
        openDownloadSheet({
          title: 'Download Event',
          baseName: getEventIcsBaseName(event.title),
          mimeType: 'text/calendar',
          contents: ics,
        });
      },
    });
  }, [closeMenu, event.eventID, event.title, mutate, openDownloadSheet]);

  return (
    <Menu.Item
      title={'Download'}
      leadingIcon={AppIcons.download}
      onPress={snackbarTry(handlePress)}
      disabled={isPending}
    />
  );
};
