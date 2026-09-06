import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModerationReportListItemProps {
  report: ReportModerationData;
}

/**
 * One report against a piece of content: reporter, handler, time, and optional message.
 */
export const ModerationReportListItem = ({report}: ModerationReportListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.flexColumn,
        },
        headerRow: {
          ...commonStyles.flexRow,
          alignItems: 'flex-start',
        },
        bylineContainer: {
          ...commonStyles.flex,
        },
        label: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
        },
        sectionLabel: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
          ...commonStyles.marginTopSmall,
        },
        byline: {
          ...commonStyles.fontSizeDefault,
        },
        unassigned: {
          ...commonStyles.fontSizeDefault,
          ...commonStyles.onBackground,
        },
        time: {
          ...commonStyles.marginLeftSmall,
        },
        message: {
          ...commonStyles.onBackground,
        },
      }),
    [commonStyles],
  );

  const onPressAuthor = useCallback(() => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: report.author.userID});
  }, [navigation, report.author.userID]);

  const onPressHandler = useCallback(() => {
    if (!report.handledBy) {
      return;
    }
    navigation.push(CommonStackComponents.userProfileScreen, {userID: report.handledBy.userID});
  }, [navigation, report.handledBy]);

  return (
    <View style={styles.container}>
      <Text style={styles.label} selectable={false}>
        Reported by:
      </Text>
      <View style={styles.headerRow}>
        <View style={styles.bylineContainer}>
          <UserBylineTag user={report.author} onPress={onPressAuthor} style={styles.byline} />
        </View>
        <RelativeTimeTag date={new Date(report.creationTime)} style={styles.time} />
      </View>
      <Text style={styles.sectionLabel} selectable={false}>
        {report.isClosed ? 'Closed by:' : 'Being handled by:'}
      </Text>
      {report.handledBy ? (
        <UserBylineTag user={report.handledBy} onPress={onPressHandler} style={styles.byline} />
      ) : (
        <Text style={styles.unassigned} selectable={false}>
          Unassigned
        </Text>
      )}
      {!!report.submitterMessage && (
        <>
          <Text style={styles.sectionLabel} selectable={false}>
            Additional information:
          </Text>
          <Text style={styles.message} selectable={false}>
            {report.submitterMessage}
          </Text>
        </>
      )}
    </View>
  );
};
