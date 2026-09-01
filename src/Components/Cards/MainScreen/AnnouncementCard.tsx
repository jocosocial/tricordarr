import moment from 'moment-timezone';
import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {ContentText} from '#src/Components/Text/ContentText';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getTimeZoneLabel} from '#src/Libraries/DateTime';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

interface AnnouncementCardProps {
  announcement: AnnouncementData;
  onPress?: () => void;
}

/**
 * Card displaying a server announcement, including author, body, and display-until time.
 * Deleted announcements use a distinct title and color so admins can tell them apart from active ones.
 */
export const AnnouncementCard = ({announcement, onPress}: AnnouncementCardProps) => {
  const {commonStyles} = useStyles();
  const {tzAtTime} = useTimeZone();
  const {appConfig} = useConfig();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        contentText: {
          ...commonStyles.onTwitarrButton,
        },
        title: {
          ...commonStyles.onTwitarrButton,
          ...commonStyles.bold,
        },
        untilTitle: {
          ...commonStyles.onTwitarrButton,
          ...commonStyles.italics,
        },
      }),
    [commonStyles],
  );
  const cardStyle = announcement.isDeleted ? commonStyles.twitarrNeutral : commonStyles.twitarrPositive;

  const untilDate = new Date(announcement.displayUntil);
  const shipTz = tzAtTime(untilDate);
  const tzLabel = getTimeZoneLabel(shipTz, untilDate, appConfig.schedule.timeZoneLabelMode);
  const displayUntilLabel =
    moment(announcement.displayUntil).tz(shipTz).format('ddd MMM D hh:mm A') + (tzLabel ? ` ${tzLabel}` : '');
  const headingPrefix = announcement.isDeleted ? 'Deleted announcement from' : 'Announcement from';

  /**
   * Card.Title got weird with multiple lines. So I just made it real Text instead.
   */
  return (
    <Card style={cardStyle} onPress={onPress}>
      <Card.Content>
        <Text variant={'bodyLarge'} style={styles.title}>
          {headingPrefix} {getUserBylineString(announcement.author, false, true)}:
        </Text>
        <ContentText textStyle={styles.contentText} text={announcement.text} />
      </Card.Content>
      <Card.Title title={`Display Until: ${displayUntilLabel}`} titleStyle={styles.untilTitle} />
    </Card>
  );
};
