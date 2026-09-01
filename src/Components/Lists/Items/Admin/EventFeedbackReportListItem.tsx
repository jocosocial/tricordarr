import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ListItem} from '#src/Components/Lists/ListItem';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {EventFeedbackReport} from '#src/Structs/ControllerStructs';

interface EventFeedbackReportListItemProps {
  report: EventFeedbackReport & {id: string};
}

/**
 * FlashList row for a feedback report: large event title, smaller host name and filed date.
 */
const EventFeedbackReportListItemInternal = ({report}: EventFeedbackReportListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          ...commonStyles.background,
          ...commonStyles.paddingRightSmall,
        },
        title: {
          ...commonStyles.onBackground,
        },
        description: {
          ...commonStyles.onBackground,
        },
      }),
    [commonStyles],
  );

  const onPress = useCallback(() => {
    navigation.push(CommonStackComponents.adminEventFeedbackReportScreen, {feedbackID: report.id});
  }, [navigation, report.id]);

  const getDescription = useCallback(() => {
    const filedDate = report.reportModDate ? new Date(report.reportModDate) : undefined;
    return (
      <View>
        <Text variant={'bodyMedium'} style={styles.description} selectable={false}>
          By {report.hostName}
        </Text>
        <Text variant={'bodyMedium'} style={styles.description} selectable={false}>
          Filed {filedDate ? <RelativeTimeTag date={filedDate} variant={'bodyMedium'} /> : 'unknown'}
        </Text>
      </View>
    );
  }, [report.hostName, report.reportModDate, styles.description]);

  return (
    <ListItem
      style={styles.item}
      title={report.eventTitle}
      titleStyle={styles.title}
      titleNumberOfLines={0}
      description={getDescription}
      descriptionStyle={styles.description}
      descriptionNumberOfLines={2}
      onPress={onPress}
    />
  );
};

export const EventFeedbackReportListItem = memo(EventFeedbackReportListItemInternal);
