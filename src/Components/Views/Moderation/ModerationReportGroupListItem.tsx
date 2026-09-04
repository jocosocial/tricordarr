import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {ListItem} from '#src/Components/Lists/ListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ReportType} from '#src/Enums/ReportType';
import {timeAgo} from '#src/Libraries/DateTime';
import {getReportGroupStatusLabel, ReportContentGroup} from '#src/Libraries/Moderation';
import {pushModerateScreen} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface ModerationReportGroupListItemProps {
  group: ReportContentGroup;
}

/**
 * One grouped report row, matching Swiftarr's open/closed reports list.
 */
export const ModerationReportGroupListItem = ({group}: ModerationReportGroupListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...commonStyles.bold,
        },
      }),
    [commonStyles],
  );

  const onPress = () => {
    if (group.reportType === ReportType.userProfile) {
      navigation.push(CommonStackComponents.profileModerateScreen, {id: group.reportedID});
      return;
    }
    pushModerateScreen(navigation, group.reportType, group.reportedID);
  };

  return (
    <ListItem
      title={`@${group.reportedUser.username}'s ${ReportType.getLabel(group.reportType)}`}
      titleStyle={styles.title}
      description={`${getReportGroupStatusLabel(group)}\nreported ${timeAgo.format(new Date(group.firstReport.creationTime))}`}
      descriptionNumberOfLines={3}
      onPress={onPress}
    />
  );
};
