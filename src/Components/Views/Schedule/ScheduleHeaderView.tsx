import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import {ScheduleHeaderAllButton} from '#src/Components/Buttons/ScheduleHeaderAllButton';
import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {ScrollShadowView, useScrollShadow} from '#src/Components/Views/Schedule/ScrollShadowView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CruiseDayData} from '#src/Types';

interface ScheduleHeaderViewProps {
  selectedCruiseDay: number;
  setCruiseDay: Dispatch<SetStateAction<number>>;
  scrollToNow?: () => void;
  enableAll?: boolean;
}

type HeaderItem = CruiseDayData | {cruiseDay: 0; isAllDays: true};

export const ScheduleHeaderView = (props: ScheduleHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {cruiseDays} = useCruise();
  const headerListRef = useRef<FlashListRef<HeaderItem>>(null);

  const {leftShadowOpacity, rightShadowOpacity, handleScroll} = useScrollShadow();

  const styles = StyleSheet.create({
    view: {
      position: 'relative',
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
    },
  });

  // Build header items array with optional "All Days" item
  const headerItems: HeaderItem[] = React.useMemo(() => {
    if (!cruiseDays) {
      return [];
    }
    if (props.enableAll) {
      return [{cruiseDay: 0, isAllDays: true}, ...cruiseDays];
    }
    return cruiseDays;
  }, [cruiseDays, props.enableAll]);

  // Calculate selected day - must be before early return per Rules of Hooks
  const safeSelectedDay = props.selectedCruiseDay ?? 1;

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
      const isAllDays = safeSelectedDay === 0;
      const isFirstDay = safeSelectedDay === 1;
      const isLastDay = safeSelectedDay === cruiseDays.length;

      if (isAllDays || isFirstDay) {
        // Scroll to start for "All Days" or Day 1
        headerListRef.current?.scrollToOffset({offset: 0, animated: false});
      } else if (isLastDay) {
        headerListRef.current?.scrollToEnd({animated: false});
      } else {
        // Adjust index when enableAll is true (items are offset by 1)
        const indexOffset = props.enableAll ? 1 : 0;
        headerListRef.current?.scrollToIndex({
          index: safeSelectedDay - 1 + indexOffset,
          viewPosition: 0.5,
          animated: false,
        });
      }

      hasScrolledOnMount.current = true;
    });

    return () => cancelAnimationFrame(rafId);
  }, [safeSelectedDay, cruiseDays, props.enableAll]);

  const renderItem = ({item}: {item: HeaderItem}) => {
    // Handle "All Days" button
    if ('isAllDays' in item && item.isAllDays) {
      const onPress = () => {
        if (props.selectedCruiseDay === 0 && props.scrollToNow) {
          props.scrollToNow();
        } else {
          props.setCruiseDay(0);
          headerListRef.current?.scrollToOffset({offset: 0, animated: true});
        }
      };
      return <ScheduleHeaderAllButton key={'all-days'} isSelected={props.selectedCruiseDay === 0} onPress={onPress} />;
    }

    // Handle regular day buttons - TypeScript knows this is CruiseDayData after the above check
    const cruiseDayItem = item as CruiseDayData;
    const onPress = () => {
      if (cruiseDayItem.cruiseDay === props.selectedCruiseDay && props.scrollToNow) {
        props.scrollToNow();
      } else {
        props.setCruiseDay(cruiseDayItem.cruiseDay);

        // Scroll based on which day is selected:
        // - All Days or First day: scroll all the way to start so no left shadow appears
        // - Last day: scroll all the way to end so no right shadow appears
        // - Middle days: center the selected day
        const isFirstDay = cruiseDayItem.cruiseDay === 1;
        const isLastDay = cruiseDayItem.cruiseDay === cruiseDays!.length;
        const indexOffset = props.enableAll ? 1 : 0;

        if (isFirstDay) {
          headerListRef.current?.scrollToOffset({offset: 0, animated: true});
        } else if (isLastDay) {
          headerListRef.current?.scrollToEnd({animated: true});
        } else {
          headerListRef.current?.scrollToIndex({
            index: cruiseDayItem.cruiseDay - 1 + indexOffset,
            viewPosition: 0.5,
            animated: true,
          });
        }
      }
    };
    return (
      <ScheduleHeaderDayButton
        key={cruiseDayItem.cruiseDay}
        cruiseDay={cruiseDayItem}
        isSelectedDay={cruiseDayItem.cruiseDay === props.selectedCruiseDay}
        onPress={onPress}
      />
    );
  };

  // Don't render if headerItems is not available yet
  if (headerItems.length === 0) {
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
        data={headerItems}
        extraData={[props.selectedCruiseDay, props.scrollToNow, props.enableAll]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
