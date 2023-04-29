import React from 'react';
import {Card, Text} from 'react-native-paper';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface UserNoteCardProps {
  user: ProfilePublicData;
}

export const UserNoteCard = ({user}: UserNoteCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card style={[commonStyles.noteContainer]}>
      <Card.Title title="Private Note" titleStyle={[commonStyles.onNoteContainer]} />
      <Card.Content>
        <Text selectable={true} style={[commonStyles.onNoteContainer, commonStyles.italics]}>
          {user.note}
        </Text>
      </Card.Content>
    </Card>
  );
};
