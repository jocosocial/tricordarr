import React from 'react';
import {List} from 'react-native-paper';
import {UserHeaderProps} from '../../../libraries/Types';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const FezParticipantListItem = ({user}: UserHeaderProps) => {
  const getAvatar = () => <UserAvatarImage userID={user.userID} />;
  const onPress = () => console.log('SoonTM');
  const {commonStyles} = useStyles();

  return <List.Item style={[commonStyles.paddingSides]} title={user.username} onPress={onPress} left={getAvatar} />;
};
