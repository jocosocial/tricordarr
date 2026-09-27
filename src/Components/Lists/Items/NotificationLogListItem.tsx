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
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

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
 * notification would do (see getNotificationEventDestination). incomingPhoneCall is the only
 * type that needs the caller, which isn't its own NotificationLogEntry field, so it's pulled
 * from the raw socket payload. Returns undefined for types with no destination (e.g.
 * phoneCallEnded).
 */
const getEntryDestination = (entry: NotificationLogEntry) => {
  let caller: SocketNotificationData['caller'];
  if (entry.type === NotificationTypeData.incomingPhoneCall) {
    try {
      caller = (JSON.parse(entry.raw) as SocketNotificationData).caller;
    } catch {
      // Raw payload wasn't parseable JSON; fall through with no caller.
    }
  }
  return getNotificationEventDestination(entry.type as keyof typeof NotificationTypeData, entry.contentID, caller);
};

/**
 * A single row in the NotificationLogScreen list. Modeled on LogEntryListItem: always shows
 * the full title/description text (no truncation), and long-press shares the raw socket
 * payload via the download sheet. Tapping opens the same content tapping the original push
 * notification would have, when that content still has a destination.
 *
 * Uses NavigationRef's global `navigate` (nested tab navigate), not useLinkTo/deep-linking:
 * NotificationLogScreen is a Common Stack screen, so wherever it was pushed from (Settings,
 * or the notification bell menu on another tab), that stack doesn't host every content screen
 * - e.g. Seamail or LFG chat live on their own tabs - and a linking-config-resolved navigation
 * can reset a tab's history in the process of getting there. A plain cross-tab navigate
 * switches to the right tab without disturbing the current stack's own back stack, so
 * returning (via the tab bar or system back) lands right back on this list. See
 * docs/Navigation.md.
 */
export const NotificationLogListItem = ({entry}: NotificationLogListItemProps) => {
  const {commonStyles} = useStyles();
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();

  const handlePress = () => {
    const destination = getEntryDestination(entry);
    if (destination) {
      navigationNavigate(destination.tab, {screen: destination.screen, params: destination.params});
    } else {
      setSnackbarPayload({message: 'Nothing to open for this event.', messageType: 'info'});
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
