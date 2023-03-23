import React from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {FezImage} from '../../Images/FezImage';
import {commonStyles} from '../../../styles';

interface SeamailListItemProps {
  fez: FezData;
}

export const SeamailListItem = ({fez}: SeamailListItemProps) => {
  const {profilePublicData} = useUserData();
  // const navigation = useNavigation();

  const style = {
    ...commonStyles.paddingSides,
  };

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header?.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => <FezImage fez={fez} />;
  const onPress = () => console.log('foo');

  return <List.Item style={style} title={fez.title} description={description} onPress={onPress} left={getAvatar} />;
};
