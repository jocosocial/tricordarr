import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {ScrollShadowView, useScrollShadow} from '#src/Components/Views/Schedule/ScrollShadowView';
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
  const headerListRef = useRef<FlashListRef<CruiseDayData>>(null);

  const {leftShadowOpacity, rightShadowOpacity, handleScroll} = useScrollShadow();

  const styles = StyleSheet.create({
    view: {
      position: 'relative',
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
    },
  });

  const renderItem = ({item}: {item: CruiseDayData}) => {
    const onPress = () => {
      if (item.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(item.cruiseDay);

        // Scroll based on which day is selected:
        // - First day: scroll all the way to start so no left shadow appears
        // - Last day: scroll all the way to end so no right shadow appears
        // - Middle days: center the selected day
        const isFirstDay = item.cruiseDay === 1;
        const isLastDay = item.cruiseDay === cruiseDays!.length;

        if (isFirstDay) {
          headerListRef.current?.scrollToOffset({offset: 0, animated: true});
        } else if (isLastDay) {
          headerListRef.current?.scrollToEnd({animated: true});
        } else {
          headerListRef.current?.scrollToIndex({
            index: item.cruiseDay - 1,
            viewPosition: 0.5,
            animated: true,
          });
        }
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

  // Don't render if cruiseDays is not available yet
  if (!cruiseDays || cruiseDays.length === 0) {
    return null;
  }

  // Calculate safe initial scroll index - only scroll if we need to show a day other than the first
  // Setting initialScrollIndex to 0 can cause FlashList to report non-zero offsets during layout
  const safeSelectedDay = props.selectedCruiseDay || 1;
  const calculatedIndex = Math.min(Math.max(safeSelectedDay - 1, 0), Math.min(cruiseDays.length - 1, 3));
  // Only use initialScrollIndex when we actually need to scroll (> 0)
  const initialScrollIndex = calculatedIndex > 0 ? calculatedIndex : undefined;

  return (
    <View style={styles.view}>
      <ScrollShadowView side={'left'} opacity={leftShadowOpacity} />
      <ScrollShadowView side={'right'} opacity={rightShadowOpacity} />

      <FlashList
        contentContainerStyle={commonStyles.paddingHorizontalSmall}
        ref={headerListRef}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={cruiseDays}
        // selectedCruiseDay is event-style 1-indexed.
        // The Math.min() is needed because the initialScrollIndex will overscroll
        // the list on load if we get to later in the week. It fixes itself if the user
        // scrolls but then it jumps.
        // Only set initialScrollIndex when > 0 to avoid layout-triggered scroll events
        initialScrollIndex={initialScrollIndex}
        extraData={[props.selectedCruiseDay, props.scrollToNow]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
