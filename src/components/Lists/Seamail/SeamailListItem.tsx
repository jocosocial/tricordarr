import React from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {commonStyles} from '../../../styles';
import {FezDataProps} from '../../../types';

export const SeamailListItem = ({fez}: FezDataProps) => {
  const {profilePublicData} = useUserData();
  // const navigation = useNavigation();

  const style = {
    ...commonStyles.paddingSides,
  };

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header?.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => <FezAvatarImage fez={fez} />;
  const onPress = () => console.log('foo');

  return <List.Item style={style} title={fez.title} description={description} onPress={onPress} left={getAvatar} />;
};
