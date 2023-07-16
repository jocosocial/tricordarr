import {Card, Text} from 'react-native-paper';
import {AndroidColor} from '@notifee/react-native';
import React from 'react';
import {useAppTheme} from '../../../styles/Theme';
import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

  return (
    <Card style={[commonStyles.marginBottomSmall, {backgroundColor: theme.colors.twitarrPositiveButton}]}>
      <Card.Title
        title={`From @${announcement.author.username}:`}
        titleStyle={{color: AndroidColor.WHITE, fontWeight: 'bold'}}
        subtitleVariant={'bodyLarge'}
        subtitleStyle={{color: AndroidColor.WHITE}}
      />
      <Card.Content>
        <Text style={{color: AndroidColor.WHITE}}>{announcement.text}</Text>
      </Card.Content>
    </Card>
  );
};
