import React, {memo} from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {SeamailTimeBadge} from '../../Text/SeamailTimeBadge';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {CommonStackComponents} from '../../Navigation/CommonScreens';
import {StyleSheet} from 'react-native';
import {SeamailListItemSwipeable} from '../../Swipeables/SeamailListItemSwipeable.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface SeamailListItemProps {
  fez: FezData;
}

const SeamailListItemInternal = ({fez}: SeamailListItemProps) => {
  const {profilePublicData} = useUserData();
  const navigation = useChatStack();
  const {commonStyles} = useStyles();
  let badgeCount = 0;
  if (fez.members) {
    badgeCount = fez.members.postCount - fez.members.readCount;
  }

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.background,
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
    <SeamailListItemSwipeable fez={fez}>
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
    </SeamailListItemSwipeable>
  );
};

export const SeamailListItem = memo(SeamailListItemInternal);
