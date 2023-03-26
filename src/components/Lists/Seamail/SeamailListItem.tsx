import React from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {commonStyles} from '../../../styles';
import {FezDataProps} from '../../../libraries/Types';
import {SeamailTimeBadge} from './SeamailTimeBadge';

export const SeamailListItem = ({fez}: FezDataProps) => {
  const {profilePublicData} = useUserData();
  // const navigation = useNavigation();
  let badgeCount = 0;
  if (fez.members) {
    badgeCount = fez.members.postCount - fez.members.readCount;
  }

  const styles = {
    item: {
      ...commonStyles.paddingSides,
    },
    title: badgeCount ? commonStyles.bold : undefined,
    description: badgeCount ? commonStyles.bold : undefined,
  };

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header?.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => <FezAvatarImage fez={fez} />;
  const onPress = () => console.log('foo');
  const getTimeBadge = () => <SeamailTimeBadge date={fez.lastModificationTime} badgeCount={badgeCount} />;

  return (
    <List.Item
      style={styles.item}
      title={fez.title}
      titleStyle={styles.title}
      description={description}
      descriptionStyle={styles.description}
      onPress={onPress}
      left={getAvatar}
      right={getTimeBadge}
    />
  );
};
