import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge} from 'react-native-paper';

import {ListItem} from '#src/Components/Lists/ListItem';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ReportType} from '#src/Enums/ReportType';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {pushModerateScreen} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerationReportGroupListItemProps {
  group: ReportContentGroup;
  showUnread?: boolean;
}

/**
 * One grouped report row, matching Swiftarr's open/closed reports list.
 * Relative time sits in the upper-right corner, with an unassigned-count badge below it.
 * Unhandled open reports are bold.
 */
export const ModerationReportGroupListItem = ({group, showUnread = false}: ModerationReportGroupListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();
  const isNew = showUnread && !group.handledBy;
  const unhandledCount = group.reports.filter(report => !report.handledBy).length;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...(isNew ? commonStyles.bold : undefined),
        },
        description: {
          ...(isNew ? commonStyles.bold : undefined),
        },
        time: {
          ...(isNew ? commonStyles.bold : undefined),
        },
        rightContainer: {
          ...commonStyles.flexStart,
          ...commonStyles.verticalContainer,
          ...commonStyles.alignItemsEnd,
        },
        badge: {
          ...commonStyles.bold,
          ...commonStyles.paddingHorizontalSmall,
        },
      }),
    [commonStyles, isNew],
  );

  const onPress = useCallback(() => {
    if (group.reportType === ReportType.userProfile) {
      navigation.push(CommonStackComponents.profileModerateScreen, {id: group.reportedID});
      return;
    }
    pushModerateScreen(navigation, group.reportType, group.reportedID);
  }, [group.reportType, group.reportedID, navigation]);

  const getRight = useCallback(
    () => (
      <View style={styles.rightContainer}>
        <RelativeTimeTag date={new Date(group.firstReport.creationTime)} style={styles.time} />
        {showUnread && unhandledCount > 0 && <Badge style={styles.badge}>{`${unhandledCount} unassigned`}</Badge>}
      </View>
    ),
    [group.firstReport.creationTime, showUnread, styles.badge, styles.rightContainer, styles.time, unhandledCount],
  );

  return (
    <ListItem
      title={`@${group.reportedUser.username}'s ${ReportType.getLabel(group.reportType)}`}
      titleStyle={styles.title}
      description={ReportContentGroup.getStatusLabel(group)}
      descriptionNumberOfLines={2}
      descriptionStyle={styles.description}
      onPress={onPress}
      right={getRight}
    />
  );
};
