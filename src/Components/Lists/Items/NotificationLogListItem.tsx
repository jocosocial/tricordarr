import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {navigate as navigationNavigate} from '#src/Libraries/NavigationRef';
import {NotificationLogEntry} from '#src/Libraries/NotificationLog/types';
import {getNotificationTypeTitle} from '#src/Libraries/Notifications/NotificationEventTitles';
import {getNotificationEventDestination} from '#src/Libraries/Notifications/SocketNotification';
import {CommonStackParamList, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface NotificationLogListItemProps {
  entry: NotificationLogEntry;
}

/**
 * A single row in the NotificationLogScreen list. Modeled on LogEntryListItem: always shows
 * the full title/description text (no truncation), and long-press shares the raw socket
 * payload via the download sheet.
 */
export const NotificationLogListItem = ({entry}: NotificationLogListItemProps) => {
  const {commonStyles} = useStyles();
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();
  const commonNavigation = useCommonStack();

  const handlePress = () => {
    const destination = getNotificationEventDestination(entry.type, entry.contentID);
    if (!destination) {
      setSnackbarPayload({message: 'Nothing to open for this event.', messageType: 'info'});
      return;
    }
    if ('tab' in destination) {
      navigationNavigate(destination.tab, {screen: destination.screen, params: destination.params});
    } else {
      const {screen, params} = destination;
      // Screen/params pairs are built in getNotificationEventDestination; Navigation's push tuple can't express that union.
      (commonNavigation.push as (name: keyof CommonStackParamList, params?: object) => void)(screen, params);
    }
  };

  const handleLongPress = () => {
    openDownloadSheet({
      title: 'Share Notification Event',
      mimeType: 'text/plain',
      contents: entry.raw,
      mode: 'text',
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
        },
        description: {
          ...commonStyles.fontSizeDefault,
          ...commonStyles.onBackground,
        },
        item: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalZero,
        },
        content: {
          ...commonStyles.paddingLeftZero,
          ...commonStyles.paddingRightZero,
        },
      }),
    [commonStyles],
  );

  return (
    <List.Item
      title={`${entry.timestamp.toLocaleString()} · ${getNotificationTypeTitle(entry.type)}`}
      titleNumberOfLines={0}
      description={entry.info}
      descriptionNumberOfLines={0}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      style={styles.item}
      contentStyle={styles.content}
      onPress={handlePress}
      onLongPress={handleLongPress}
    />
  );
};
