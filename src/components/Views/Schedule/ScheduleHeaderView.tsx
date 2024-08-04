import React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {ScheduleHeaderDayView} from './ScheduleHeaderDayView.tsx';
import {getCruiseDayData} from '../../../libraries/DateTime.ts';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {FlashList} from '@shopify/flash-list';
import {CruiseDayData} from '../../../libraries/Types';

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
      // height: 60,
      // width: 100,
      // backgroundColor: 'pink',
    },
    buttonContainer: {
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const renderItem = ({item}: {item: CruiseDayData}) => (
    <View key={item.cruiseDay} style={styles.buttonContainer}>
      <ScheduleHeaderDayView cruiseDay={item} isToday={item.cruiseDay === props.selectedCruiseDay} />
    </View>
  );

  return (
    <View style={styles.view}>
      <FlashList
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={90}
        data={cruiseDays}
        initialScrollIndex={props.selectedCruiseDay - 1} // selectedCruiseDay is event-style 1-indexed.
      />
    </View>
  );
};
