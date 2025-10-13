import {FlashList} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CruiseDayData} from '#src/Types';

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
