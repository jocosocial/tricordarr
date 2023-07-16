import {Card, Text} from 'react-native-paper';
import {AndroidColor} from '@notifee/react-native';
import React, {useEffect, useState} from 'react';
import {useAppTheme} from '../../../styles/Theme';
import {AnnouncementData} from '../../../libraries/Structs/ControllerStructs';

export const AnnouncementCard = ({announcement}: {announcement: AnnouncementData}) => {
  const theme = useAppTheme();
  return (
    <Card style={{backgroundColor: theme.colors.twitarrPositiveButton}}>
      <Card.Title title={`From @${announcement.author.username}:`} titleStyle={{color: AndroidColor.WHITE, fontWeight: 'bold'}} subtitleVariant={'bodyLarge'} subtitleStyle={{color: AndroidColor.WHITE}} />
      <Card.Content>
        <Text style={{color: AndroidColor.WHITE}}>{announcement.text}</Text>
      </Card.Content>
    </Card>
  );
};
