import {ForumNewBadge} from '../../../Badges/ForumNewBadge';
import {ForumCategoryListItemBase} from './ForumCategoryListItemBase';
import React from 'react';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {StyleSheet, View} from 'react-native';
import {commonStyles} from '../../../../styles';
import {Text} from 'react-native-paper';
import pluralize from 'pluralize';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents} from '../../../../libraries/Enums/Navigation';

export const ForumMentionsCategoryListItem = () => {
  const {userNotificationData} = useUserNotificationData();
  const forumNavigation = useForumStackNavigation();
  const styles = StyleSheet.create({
    rightContainer: {
      ...commonStyles.marginLeftSmall,
    },
    rightContent: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsCenter,
    },
  });

  const getRight = () => (
    <View style={styles.rightContainer}>
      <View style={styles.rightContent}>
        <ForumNewBadge unreadCount={userNotificationData?.newForumMentionCount} unit={'mention'} />
        {userNotificationData && (
          <Text variant={'bodyMedium'}>
            {userNotificationData.forumMentionCount} {pluralize('mention', userNotificationData.forumMentionCount)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ForumCategoryListItemBase
      title={'Posts Mentioning You'}
      onPress={() => forumNavigation.push(ForumStackComponents.forumPostMentionScreen)}
      description={'Posts from others that mention you in forums.'}
      right={getRight}
    />
  );
};
