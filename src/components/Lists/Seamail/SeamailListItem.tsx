import React from 'react';
import {Badge, List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {commonStyles} from '../../../styles';
import {FezDataProps} from '../../../libraries/Types';
import {RelativeTimeTag} from '../../Text/RelativeTimeTag';
import {View} from 'react-native';

const SeamailRight = ({date, badgeCount}: {date: Date; badgeCount: number}) => {
  return (
    <View style={commonStyles.verticalCenterContainer}>
      <View style={commonStyles.flexRow}>
        <RelativeTimeTag date={date} />
        {!!badgeCount && <Badge style={commonStyles.marginLeftSmall}>{badgeCount}</Badge>}
      </View>
    </View>
  );
};

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

  return (
    <List.Item
      style={styles.item}
      title={fez.title}
      titleStyle={styles.title}
      description={description}
      descriptionStyle={styles.description}
      onPress={onPress}
      left={getAvatar}
      right={() => <SeamailRight date={fez.lastModificationTime} badgeCount={badgeCount} />}
    />
  );
};
