import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {navigate as navigationNavigate} from '#src/Libraries/NavigationRef';
import {NotificationLogEntry} from '#src/Libraries/NotificationLog/types';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {getNotificationEventDestination} from '#src/Libraries/Notifications/SocketNotification';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

interface NotificationLogListItemProps {
  entry: NotificationLogEntry;
}

/**
 * The user-facing title for a notification log entry's type. Falls back to the raw type
 * string for types with no category entry (e.g. alertwordTwarrt, twarrtMention, or an
 * unrecognized/'unknown' type).
 */
const getTypeTitle = (type: string): string => {
  const category = contentNotificationCategories[type as keyof typeof contentNotificationCategories];
  return category?.title ?? type;
};

/**
 * Where tapping this entry should navigate, mirroring what tapping the equivalent push
 * notification would do (see getNotificationEventDestination). Returns undefined for types
 * with no destination (e.g. incomingPhoneCall/phoneCallEnded, which have no content of their
 * own to open).
 */
const getEntryDestination = (entry: NotificationLogEntry) => {
  return getNotificationEventDestination(entry.type as keyof typeof NotificationTypeData, entry.contentID);
};

/**
 * A single row in the NotificationLogScreen list. Modeled on LogEntryListItem: always shows
 * the full title/description text (no truncation), and long-press shares the raw socket
 * payload via the download sheet. Tapping opens the same content tapping the original push
 * notification would have, when that content still has a destination.
 *
 * Almost every destination is a Common Stack screen, so it's pushed on the *current* stack
 * (`useCommonStack()`) - whatever tab NotificationLogScreen itself is mounted on - rather than
 * switching tabs. That's what makes the back button return to the log: NotificationLogScreen
 * stays underneath on that same stack. Only the one destination with no Common Stack
 * equivalent (announcement, whose destination is the home tab's own root screen) falls back to
 * NavigationRef's cross-tab `navigate` - "back" there behaves like any other tab switch.
 */
export const NotificationLogListItem = ({entry}: NotificationLogListItemProps) => {
  const {commonStyles} = useStyles();
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();
  const commonNavigation = useCommonStack();

  const handlePress = () => {
    const destination = getEntryDestination(entry);
    if (!destination) {
      setSnackbarPayload({message: 'Nothing to open for this event.', messageType: 'info'});
      return;
    }
    if (destination.tab) {
      navigationNavigate(destination.tab, {screen: destination.screen, params: destination.params});
    } else {
      (commonNavigation.push as (name: string, params?: object) => void)(destination.screen, destination.params);
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
      title={`${entry.timestamp.toLocaleString()} · ${getTypeTitle(entry.type)}`}
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
