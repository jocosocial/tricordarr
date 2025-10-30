import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {FezAvatarImage} from '#src/Components/Images/FezAvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {SeamailMessageCountIndicator} from '#src/Components/Text/SeamailMessageCountIndicator';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
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
      justifyContent: 'center',
    },
    postCountColor: {
      color: '#cfcfcf',
    },
  });

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData?.header.userID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const getAvatar = () => (
    <View style={[styles.leftContainer, commonStyles.alignItemsCenter]}>
      <FezAvatarImage fez={fez} />
    </View>
  );

  const onPress = () =>
    navigation.push(CommonStackComponents.seamailChatScreen, {
      fezID: fez.fezID,
    });

  const getRight = () => {
    const totalPostCount = fez.members?.postCount || 0;

    if (fez.members?.isMuted) {
      return (
        <View style={styles.leftContainer}>
          <AppIcon icon={AppIcons.mute} />
        </View>
      );
    }

    const timeStyle = badgeCount ? [commonStyles.bold] : undefined;

    return (
      <View style={[commonStyles.verticalContainer, commonStyles.alignItemsEnd]}>
        <SeamailMessageCountIndicator badgeCount={badgeCount} totalPostCount={totalPostCount} />
        <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.marginTopTiny]}>
          <RelativeTimeTag variant={'bodySmall'} date={new Date(fez.lastModificationTime)} style={timeStyle} />
        </View>
      </View>
    );
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
