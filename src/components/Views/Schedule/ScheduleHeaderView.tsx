import React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {ScheduleHeaderDayView} from './ScheduleHeaderDayView.tsx';
import {getCruiseDayData} from '../../../libraries/DateTime.ts';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';

interface ScheduleHeaderViewProps {
  selectedCruiseDay: number;
}

export const ScheduleHeaderView = (props: ScheduleHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {cruiseDays} = useCruise();
  const styles = StyleSheet.create({
    view: {
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
    },
    buttonContainer: {
      ...commonStyles.paddingHorizontalSmall,
    },
  });
  return (
    <View style={styles.view}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {cruiseDays.map(cd => (
          <View key={cd.cruiseDay} style={styles.buttonContainer}>
            <ScheduleHeaderDayView cruiseDay={cd} isToday={cd.cruiseDay === props.selectedCruiseDay} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
