import React from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../Libraries/Enums/Icons';
import {Avatar} from 'react-native-paper';

interface FezParticipantAddItemProps {
  onPress?: () => void;
  title?: string;
}

export const FezParticipantAddItem = ({onPress, title = 'Add participant'}: FezParticipantAddItemProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const getAvatar = () => <Avatar.Icon icon={AppIcons.new} size={styleDefaults.avatarSize} />;

  return <List.Item style={[commonStyles.paddingHorizontal]} title={title} onPress={onPress} left={getAvatar} />;
};
