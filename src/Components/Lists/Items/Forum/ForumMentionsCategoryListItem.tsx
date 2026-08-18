import pluralize from 'pluralize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ForumNewBadge} from '#src/Components/Badges/ForumNewBadge';
import {ForumCategoryListItemBase} from '#src/Components/Lists/Items/Forum/ForumCategoryListItemBase';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

export const ForumMentionsCategoryListItem = () => {
  const {commonStyles} = useStyles();
  const {data: userNotificationData} = useUserNotificationDataQuery();
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
        {!!userNotificationData?.forumMentionCount && (
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
