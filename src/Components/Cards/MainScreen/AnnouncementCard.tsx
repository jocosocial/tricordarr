import moment from 'moment-timezone';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {ContentText} from '#src/Components/Text/ContentText';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const {commonStyles} = useStyles();
  const {tzAtTime, abbrevAtTime} = useTimeZone();

  const styles = StyleSheet.create({
    contentText: {
      ...commonStyles.onTwitarrButton,
    },
    title: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
  });

  const untilDate = new Date(announcement.displayUntil);
  const shipTz = tzAtTime(untilDate);
  const shipAbbr = abbrevAtTime(untilDate);
  const displayUntilLabel =
    moment(announcement.displayUntil).tz(shipTz).format('ddd MMM D hh:mm A') + (shipAbbr ? ` ${shipAbbr}` : '');

  /**
   * Card.Title got weird with multiple lines. So I just made it real Text instead.
   */
  return (
    <Card style={commonStyles.twitarrPositive}>
      <Card.Content>
        <Text variant={'bodyLarge'} style={styles.title}>
          Announcement from {getUserBylineString(announcement.author, false, true)}:
        </Text>
        <ContentText textStyle={styles.contentText} text={announcement.text} />
      </Card.Content>
      <Card.Title
        title={`Display Until: ${displayUntilLabel}`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.italics]}
      />
    </Card>
  );
};
