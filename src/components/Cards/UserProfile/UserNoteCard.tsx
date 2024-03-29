import React from 'react';
import {Card, Text} from 'react-native-paper';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface UserNoteCardProps {
  user: ProfilePublicData;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const UserNoteCard = ({user, onPress, onLongPress}: UserNoteCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card style={[commonStyles.noteContainer]} onPress={onPress} onLongPress={onLongPress}>
      <Card.Title title="Private Note" titleStyle={[commonStyles.onNoteContainer]} />
      <Card.Content>
        <Text selectable={true} style={[commonStyles.onNoteContainer, commonStyles.italics]}>
          {user.note}
        </Text>
      </Card.Content>
    </Card>
  );
};
