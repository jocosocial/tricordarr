import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useCallback, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View} from 'react-native';
import {useSharedValue, withTiming} from 'react-native-reanimated';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {ScrollShadowView} from '#src/Components/Views/Schedule/ScrollShadowView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CruiseDayData} from '#src/Types';

const SCROLL_THRESHOLD = 5;
const ANIMATION_DURATION = 200;

interface ScheduleHeaderViewProps {
  selectedCruiseDay: number;
  setCruiseDay: Dispatch<SetStateAction<number>>;
  scrollToNow?: () => void;
}

export const ScheduleHeaderView = (props: ScheduleHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {cruiseDays} = useCruise();
  const headerListRef = useRef<FlashListRef<CruiseDayData>>(null);

  const leftShadowOpacity = useSharedValue(0);
  const rightShadowOpacity = useSharedValue(1);

  const styles = StyleSheet.create({
    view: {
      position: 'relative',
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
    },
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const maxScrollX = contentSize.width - layoutMeasurement.width;

      // Show left shadow when not at the start
      const showLeftShadow = contentOffset.x > SCROLL_THRESHOLD;
      leftShadowOpacity.value = withTiming(showLeftShadow ? 1 : 0, {duration: ANIMATION_DURATION});

      // Show right shadow when not at the end
      const showRightShadow = contentOffset.x < maxScrollX - SCROLL_THRESHOLD;
      rightShadowOpacity.value = withTiming(showRightShadow ? 1 : 0, {duration: ANIMATION_DURATION});
    },
    [leftShadowOpacity, rightShadowOpacity],
  );

  const renderItem = ({item}: {item: CruiseDayData}) => {
    const onPress = () => {
      if (item.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(item.cruiseDay);

        // Scroll based on which day is selected:
        // - First day: scroll all the way to start so no left shadow
        // - Last day: scroll all the way to end so no right shadow
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
        contentContainerStyle={{...commonStyles.paddingHorizontalSmall}}
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
