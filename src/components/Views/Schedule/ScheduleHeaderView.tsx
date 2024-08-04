import React, {Dispatch, SetStateAction} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {ScheduleHeaderDayView} from './ScheduleHeaderDayView.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {FlashList} from '@shopify/flash-list';
import {CruiseDayData} from '../../../libraries/Types';

interface ScheduleHeaderViewProps {
  selectedCruiseDay: number;
  setCruiseDay: Dispatch<SetStateAction<number>>;
  scrollToNow?: () => void;
}

export const ScheduleHeaderView = (props: ScheduleHeaderViewProps) => {
  const {commonStyles} = useStyles();
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

  const renderItem = ({item}: {item: CruiseDayData}) => {
    const onPress = () => {
      if (item.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(item.cruiseDay);
      }
    };
    return (
      <TouchableOpacity key={item.cruiseDay} style={styles.buttonContainer} onPress={onPress}>
        <ScheduleHeaderDayView cruiseDay={item} isToday={item.cruiseDay === props.selectedCruiseDay} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.view}>
      <FlashList
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={90}
        data={cruiseDays}
        initialScrollIndex={props.selectedCruiseDay - 1} // selectedCruiseDay is event-style 1-indexed.
        extraData={[props.selectedCruiseDay, props.scrollToNow]}
      />
    </View>
  );
};
