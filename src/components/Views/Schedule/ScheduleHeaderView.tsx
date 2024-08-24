import React, {Dispatch, SetStateAction, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {ScheduleHeaderDayButton} from '../../Buttons/ScheduleHeaderDayButton.tsx';
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
  const headerListRef = useRef<FlashList<any>>(null);

  const styles = StyleSheet.create({
    view: {
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
    },
    buttonContainer: {
      ...commonStyles.paddingHorizontalTiny,
    },
  });

  const renderItem = ({item}: {item: CruiseDayData}) => {
    const onPress = () => {
      if (item.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(item.cruiseDay);
        headerListRef.current?.scrollToIndex({
          index: item.cruiseDay - 1,
          viewPosition: 0.5,
          animated: true,
        });
      }
    };
    return (
      <TouchableOpacity key={item.cruiseDay} style={styles.buttonContainer} onPress={onPress}>
        <ScheduleHeaderDayButton cruiseDay={item} isToday={item.cruiseDay === props.selectedCruiseDay} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.view}>
      <FlashList
        ref={headerListRef}
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
