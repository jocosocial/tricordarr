import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {FezAvatarImage} from '#src/Components/Images/FezAvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {SeamailTimeBadge} from '#src/Components/Text/SeamailTimeBadge';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface SeamailListItemProps {
  fez: FezData;
}

const SeamailListItemInternal = ({fez}: SeamailListItemProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
  const navigation = useChatStack();
  const {commonStyles} = useStyles();
  let badgeCount = 0;
  if (fez.members) {
    badgeCount = fez.members.postCount - fez.members.readCount;
  }

  const styles = StyleSheet.create({
    title: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
    description: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
    leftContainer: {
      ...commonStyles.paddingLeftSmall,
    },
  });

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData?.header.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => (
    <View style={styles.leftContainer}>
      <FezAvatarImage fez={fez} />
    </View>
  );

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
    <ListItem
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
