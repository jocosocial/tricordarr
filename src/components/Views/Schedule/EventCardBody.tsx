import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ScheduleItem} from '../../../libraries/Types';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';

/**
 * Main content body of a Schedule Event card. Just text with some fancy time string rendering.
 * @param scheduleItem ScheduleItem object.
 */
export const EventCardBody = ({scheduleItem}: {scheduleItem: ScheduleItem}) => {
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
      <Text style={styles.bodyText} variant={'titleMedium'} numberOfLines={1}>
        {scheduleItem.title}
      </Text>
      <Text style={styles.bodyText} variant={'bodyMedium'} numberOfLines={1}>
        {getDurationString(scheduleItem.startTime, scheduleItem.endTime, scheduleItem.timeZone)}
      </Text>
      <Text style={styles.bodyText} variant={'bodyMedium'} numberOfLines={1}>
        {scheduleItem.location}
      </Text>
    </View>
  );
};
