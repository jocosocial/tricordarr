import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useEffect, useRef} from 'react';
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

  // Calculate selected day - must be before early return per Rules of Hooks
  const safeSelectedDay = props.selectedCruiseDay || 1;

  // Center the selected day on initial mount only - must be before early return per Rules of Hooks
  // Use a ref to track if we've done the initial scroll
  const hasScrolledOnMount = useRef(false);

  useEffect(() => {
    // Check data availability first, before checking if we've scrolled
    if (!headerListRef.current || !cruiseDays || cruiseDays.length === 0) {
      return;
    }

    // Only scroll if we haven't done it yet
    if (hasScrolledOnMount.current) {
      return;
    }

    // Use requestAnimationFrame to ensure scroll happens after layout is complete
    const rafId = requestAnimationFrame(() => {
      const isFirstDay = safeSelectedDay === 1;
      const isLastDay = safeSelectedDay === cruiseDays.length;

      if (isFirstDay) {
        headerListRef.current?.scrollToOffset({offset: 0, animated: false});
      } else if (isLastDay) {
        headerListRef.current?.scrollToEnd({animated: false});
      } else {
        headerListRef.current?.scrollToIndex({
          index: safeSelectedDay - 1,
          viewPosition: 0.5,
          animated: false,
        });
      }

      hasScrolledOnMount.current = true;
    });

    return () => cancelAnimationFrame(rafId);
  }, [safeSelectedDay, cruiseDays]);

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
        extraData={[props.selectedCruiseDay, props.scrollToNow]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
