import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ScheduleItem} from '../../../libraries/Types';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';

/**
 * Main content body of a Schedule Event card. Just text with some fancy time string rendering.
 * @param scheduleItem ScheduleItem object.
 * @param includeDay Whether to include the month and day in the display string.
 */
export const EventCardBody = ({scheduleItem, includeDay}: {scheduleItem: ScheduleItem; includeDay: boolean}) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    contentBody: {
      ...commonStyles.flex,
      ...commonStyles.marginLeft,
      ...commonStyles.paddingVertical,
    },
    bodyText: {
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <View style={styles.contentBody}>
      <Text style={styles.bodyText} variant={'titleMedium'}>
        {scheduleItem.title}
      </Text>
      <Text style={styles.bodyText} variant={'bodyMedium'}>
        {getDurationString(scheduleItem.startTime, scheduleItem.endTime, scheduleItem.timeZone, includeDay)}
      </Text>
      <Text style={styles.bodyText} variant={'bodyMedium'}>
        {scheduleItem.location}
      </Text>
    </View>
  );
};
