import React from 'react';
import {Card, Text, TouchableRipple} from 'react-native-paper';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import pluralize from 'pluralize';
import {View} from 'react-native';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';

export const ModeratorCard = () => {
  const {userNotificationData} = useUserNotificationData();
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();

  const onPress = () => commonNavigation.push(CommonStackComponents.siteUIScreen, {
    resource: 'moderator'
  });

  if (!userNotificationData?.moderatorData) {
    return <></>;
  }

  const interactionCount =
    userNotificationData.moderatorData.openReportCount +
    userNotificationData.moderatorData.newModeratorSeamailMessageCount +
    userNotificationData.moderatorData.newModeratorForumMentionCount;

  return (
    <Card style={[commonStyles.marginBottom]}>
      <TouchableRipple onPress={onPress}>
        <View>
          <Card.Content style={[commonStyles.marginVertical]}>
            <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.marginBottomSmall]}>
              <AppIcon icon={AppIcons.moderator} />
              <Text style={[commonStyles.bold]}>&nbsp;Moderator Summary</Text>
            </View>
            {interactionCount ? (
              <>
                <Text>
                  {userNotificationData.moderatorData.openReportCount} open{' '}
                  {pluralize('report', userNotificationData.moderatorData.openReportCount)}
                </Text>
                <Text>
                  {userNotificationData.moderatorData.newModeratorSeamailMessageCount} new{' '}
                  {pluralize('message', userNotificationData.moderatorData.newModeratorSeamailMessageCount)}
                </Text>
                <Text>
                  {userNotificationData.moderatorData.newModeratorForumMentionCount} new{' '}
                  {pluralize('mention', userNotificationData.moderatorData.newModeratorForumMentionCount)}
                </Text>
              </>
            ) : (
              <Text>No new interactions</Text>
            )}
          </Card.Content>
        </View>
      </TouchableRipple>
    </Card>
  );
};
