import React from 'react';
import {Card, Text} from 'react-native-paper';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface UserAboutCardProps {
  user: ProfilePublicData;
}

export const UserAboutCard = ({user}: UserAboutCardProps) => {
  return (
    <Card>
      <Card.Title title="About" />
      <Card.Content>
        <Text selectable={true}>{user.about}</Text>
      </Card.Content>
    </Card>
  );
};
