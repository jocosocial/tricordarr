import React from 'react';
import {List} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Avatar} from 'react-native-paper';

interface FezParticipantAddItemProps {
  onPress?: () => void;
}

export const FezParticipantAddItem = ({onPress}: FezParticipantAddItemProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const getAvatar = () => <Avatar.Icon icon={AppIcons.new} size={styleDefaults.avatarSize} />;

  return (
    <List.Item style={[commonStyles.paddingHorizontal]} title={'Add participant'} onPress={onPress} left={getAvatar} />
  );
};
