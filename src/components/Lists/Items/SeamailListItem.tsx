import React, {memo} from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {commonStyles} from '../../../styles';
import {SeamailTimeBadge} from '../../Text/SeamailTimeBadge';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {CommonStackComponents} from '../../Navigation/CommonScreens';
import {StyleSheet} from 'react-native';

interface SeamailListItemProps {
  fez: FezData;
}

const SeamailListItemInternal = ({fez}: SeamailListItemProps) => {
  const {profilePublicData} = useUserData();
  const navigation = useChatStack();
  let badgeCount = 0;
  if (fez.members) {
    badgeCount = fez.members.postCount - fez.members.readCount;
  }

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    title: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
    description: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
  });

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData?.header.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => <FezAvatarImage fez={fez} />;
  const onPress = () =>
    navigation.push(CommonStackComponents.seamailChatScreen, {
      fezID: fez.fezID,
    });
  const getRight = () => {
    if (fez.members?.isMuted) {
      return <AppIcon icon={AppIcons.mute} />;
    }
    return <SeamailTimeBadge date={fez.lastModificationTime} badgeCount={badgeCount} />;
  };

  return (
    <List.Item
      style={styles.item}
      title={fez.title}
      titleStyle={styles.title}
      titleNumberOfLines={0}
      description={description}
      descriptionStyle={styles.description}
      onPress={onPress}
      left={getAvatar}
      right={getRight}
    />
  );
};

export const SeamailListItem = memo(SeamailListItemInternal);
