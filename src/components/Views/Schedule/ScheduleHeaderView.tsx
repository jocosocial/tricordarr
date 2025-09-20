import React, {Dispatch, SetStateAction, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {ScheduleHeaderDayButton} from '../../Buttons/ScheduleHeaderDayButton.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {FlashList} from '@shopify/flash-list';
import {CruiseDayData} from '../../../Libraries/Types/index.ts';

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
  });

  const renderItem = ({item}: {item: CruiseDayData}) => {
    const onPress = () => {
      if (item.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(item.cruiseDay);
        // Killing this to prevent the days from jumping the list around.
        // headerListRef.current?.scrollToIndex({
        //   index: item.cruiseDay - 1,
        //   viewPosition: 0.5,
        //   animated: true,
        // });
      }
    };
    return (
      <ScheduleHeaderDayButton
        key={item.cruiseDay}
        cruiseDay={item}
        isSelectedDay={item.cruiseDay === props.selectedCruiseDay}
        onPress={onPress}
      />
    );
  };

  return (
    <View style={styles.view}>
      <FlashList
        ref={headerListRef}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={75}
        data={cruiseDays}
        // selectedCruiseDay is event-style 1-indexed.
        // The Math.min() is needed because the initialScrollIndex will overscroll
        // the list on load if we get to later in the week. It fixes itself if the user
        // scrolls but then it jumps.
        initialScrollIndex={Math.min(props.selectedCruiseDay - 1, 3)}
        extraData={[props.selectedCruiseDay, props.scrollToNow]}
      />
    </View>
  );
};
