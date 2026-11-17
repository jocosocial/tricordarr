import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

import {useDownloadSheet} from '#src/Context/Contexts/DownloadSheetContext';
import {useLinking} from '#src/Context/Contexts/LinkingContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {accountName} from '#src/Libraries/Account';
import {NotificationLogEntry} from '#src/Libraries/NotificationLog/types';
import {appUrl} from '#src/Libraries/UrlParser';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

interface NotificationLogListItemProps {
  entry: NotificationLogEntry;
}

/**
 * A single row in the NotificationLogScreen list. Modeled on LogEntryListItem: always shows
 * the full title/description text (no truncation), and long-press shares the raw socket
 * payload via the download sheet. An event that another account received is labelled with that
 * account and does not open, since its content belongs to that account's session.
 */
export const NotificationLogListItem = ({entry}: NotificationLogListItemProps) => {
  const {commonStyles} = useStyles();
  const {openDownloadSheet} = useDownloadSheet();
  const {setSnackbarPayload} = useSnackbar();
  const {openAppUrl} = useLinking();
  const {accounts, currentAccount} = useSession();
  // Entries without an account (iOS, older builds) are taken to be the active account's.
  const isOtherAccount = entry.accountID !== undefined && entry.accountID !== currentAccount?.accountID;
  const otherAccount = isOtherAccount ? accounts.find(account => account.accountID === entry.accountID) : undefined;
  const otherAccountName = otherAccount ? accountName(otherAccount) : 'another account';

  const handlePress = () => {
    if (isOtherAccount) {
      setSnackbarPayload({
        message: `This event was for ${otherAccountName}. Switch accounts to open it.`,
        messageType: 'info',
      });
      return;
    }
    // Same route the event's push notification opens. openAppUrl pushes it onto the current stack
    // when it can, so back returns to the log.
    const url = NotificationTypeData.getUrl(entry.type, entry.contentID);
    if (!url) {
      setSnackbarPayload({message: 'Nothing to open for this event.', messageType: 'info'});
      return;
    }
    openAppUrl(appUrl(url));
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
      title={`${entry.timestamp.toLocaleString()} · ${NotificationTypeData.getTitle(entry.type)}${isOtherAccount ? ` · ${otherAccountName}` : ''}`}
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
