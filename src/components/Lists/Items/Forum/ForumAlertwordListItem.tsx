import {ForumStackComponents} from '../../../../libraries/Enums/Navigation';
import {ForumCategoryListItemBase} from './ForumCategoryListItemBase';
import React from 'react';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {Text} from 'react-native-paper';
import {View} from 'react-native';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {ForumNewBadge} from '../../../Badges/ForumNewBadge';

interface ForumAlertwordListItemProps {
  alertword: string;
}

export const ForumAlertwordListItem = (props: ForumAlertwordListItemProps) => {
  const navigation = useForumStackNavigation();
  const {userNotificationData} = useUserNotificationData();
  const {commonStyles} = useStyles();

  const undWords = userNotificationData?.alertWords.map(aw => aw.alertword) || []
  console.log(userNotificationData?.alertWords);
  const getRight = () => {
    if (undWords.includes(props.alertword)) {
      const undWordData = userNotificationData?.alertWords.find(aw => aw.alertword === props.alertword);
      if (!undWordData) {
        return <></>;
      }
      return (
        <View style={commonStyles.flexRow}>
          <Text variant={'bodyMedium'}>{undWordData.forumMentionCount} mentions</Text>
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
