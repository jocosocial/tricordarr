import React from 'react';
import {Badge, List, Text} from 'react-native-paper';
import {commonStyles} from '../../../../styles';
import {ForumListData, UserHeader} from '../../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import pluralize from 'pluralize';
import {RelativeTimeTag} from '../../../Text/RelativeTimeTag';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents} from '../../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {AppIcon} from '../../../Icons/AppIcon';
import {useAppTheme} from '../../../../styles/Theme';
import {ForumNewBadge} from '../../../Badges/ForumNewBadge';
import {getEventTimeString} from '../../../../libraries/DateTime';

interface ForumThreadListItemProps {
  forumData: ForumListData;
}

export const ForumThreadListItem = ({forumData}: ForumThreadListItemProps) => {
  const forumNavigation = useForumStackNavigation();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    item: {
      // ...commonStyles.paddingHorizontal,
      // ...commonStyles.paddingLeftZero,
    },
    title: commonStyles.bold,
    rightContainer: {
      ...commonStyles.marginLeftSmall,
    },
    rightContent: {
      ...commonStyles.flexRow,
    },
  });

  const getRight = () => {
    const unreadCount = forumData.postCount - forumData.readCount;
    if (unreadCount || forumData.isFavorite || forumData.isMuted || forumData.isLocked) {
      return (
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {unreadCount !== 0 && !forumData.isMuted && <ForumNewBadge unreadCount={unreadCount} unit={'post'} />}
            {forumData.isFavorite && <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />}
            {forumData.isMuted && <AppIcon icon={AppIcons.mute} color={theme.colors.twitarrNegativeButton} />}
            {forumData.isLocked && <AppIcon icon={AppIcons.locked} color={theme.colors.twitarrNegativeButton} />}
          </View>
        </View>
      );
    }
  };
  const getDescription = () => (
    <View>
      {forumData.eventTime && (
        <Text variant={'bodyMedium'}>{getEventTimeString(forumData.eventTime, forumData.timeZone)}</Text>
      )}
      <Text variant={'bodyMedium'}>
        {forumData.postCount} {pluralize('post', forumData.postCount)}
      </Text>
      <Text variant={'bodyMedium'}>
        Created <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumData.createdAt)} /> by{' '}
        {UserHeader.getByline(forumData.creator)}
      </Text>
      {forumData.lastPostAt && (
        <Text variant={'bodyMedium'}>
          Last post <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumData.lastPostAt)} />
          {forumData.lastPoster && <Text variant={'bodyMedium'}> by {UserHeader.getByline(forumData.lastPoster)}</Text>}
        </Text>
      )}
    </View>
  );
  const onPress = () => forumNavigation.push(ForumStackComponents.forumThreadScreen, {forumID: forumData.forumID});

  return (
    <List.Item
      style={styles.item}
      title={forumData.title}
      titleStyle={styles.title}
      titleNumberOfLines={0}
      description={getDescription}
      onPress={onPress}
      right={getRight}
    />
  );
};
