import pluralize from 'pluralize';
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {ForumNewBadge} from '#src/Components/Badges/ForumNewBadge';
import {ForumCategoryListItemBase} from '#src/Components/Lists/Items/Forum/ForumCategoryListItemBase';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumStackComponents, useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

interface ForumAlertwordListItemProps {
  alertword: string;
}

export const ForumAlertwordListItem = (props: ForumAlertwordListItemProps) => {
  const navigation = useForumStackNavigation();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  const {commonStyles} = useStyles();

  const undWords = userNotificationData?.alertWords.map(aw => aw.alertword) || [];
  const getRight = () => {
    if (undWords.includes(props.alertword)) {
      const undWordData = userNotificationData?.alertWords.find(aw => aw.alertword === props.alertword);
      if (!undWordData) {
        return <></>;
      }
      return (
        <View style={commonStyles.flexRow}>
          <Text variant={'bodyMedium'}>
            {undWordData.forumMentionCount} {pluralize('match', undWordData.forumMentionCount)}
          </Text>
          <View style={commonStyles.marginLeftSmall}>
            <ForumNewBadge unreadCount={undWordData.newForumMentionCount} />
          </View>
        </View>
      );
    }
  };

  return (
    <ForumCategoryListItemBase
      title={props.alertword}
      onPress={() =>
        navigation.push(ForumStackComponents.forumPostAlertwordScreen, {
          alertWord: props.alertword,
        })
      }
      right={getRight}
    />
  );
};
