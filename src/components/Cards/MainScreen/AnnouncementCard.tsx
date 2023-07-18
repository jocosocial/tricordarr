import {Card} from 'react-native-paper';
import React from 'react';
import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ContentText} from '../../Text/ContentText';

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
        <ContentText textStyle={[commonStyles.onTwitarrButton]} text={announcement.text} />
      </Card.Content>
    </Card>
  );
};
