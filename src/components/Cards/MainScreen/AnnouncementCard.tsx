import {Card, Text} from 'react-native-paper';
import React from 'react';
import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const {commonStyles} = useStyles();

  return (
    <Card style={[commonStyles.marginBottomSmall, commonStyles.twitarrPositive]}>
      <Card.Title
        title={`From @${announcement.author.username}:`}
        titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={[commonStyles.onTwitarrButton]}
      />
      <Card.Content>
        <Text style={[commonStyles.onTwitarrButton]}>{announcement.text}</Text>
      </Card.Content>
    </Card>
  );
};
