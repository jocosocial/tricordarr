import moment from 'moment-timezone';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';

import {ContentText} from '#src/Components/Text/ContentText';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AnnouncementData} from '#src/Structs/ControllerStructs';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    contentText: {
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <Card style={commonStyles.twitarrPositive}>
      <Card.Title
        title={`From ${getUserBylineString(announcement.author, false, true)}:`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content>
        <ContentText textStyle={styles.contentText} text={announcement.text} />
      </Card.Content>
      <Card.Title
        title={`Display Until: ${moment(announcement.displayUntil).format('ddd MMM D hh:mm A')}`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.italics]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
    </Card>
  );
};
