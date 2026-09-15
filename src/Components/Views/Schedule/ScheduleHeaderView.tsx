import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useRef} from 'react';
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
  const hasCompletedInitialScroll = useRef(false);

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

  /**
   * Scroll the day-chip strip so the selected day is on screen.
   * All Days / first day snap to start (no left shadow); last day to end (no right shadow);
   * middle days are centered. Index is offset by 1 when the All Days chip is present.
   */
  const scrollHeaderToDay = useCallback(
    (day: number, animated: boolean) => {
      if (!headerListRef.current || !cruiseDays || cruiseDays.length === 0) {
        return;
      }

      const isAllDays = day === 0;
      const isFirstDay = day === 1;
      const isLastDay = day === cruiseDays.length;

      if (isAllDays || isFirstDay) {
        headerListRef.current.scrollToOffset({offset: 0, animated});
      } else if (isLastDay) {
        headerListRef.current.scrollToEnd({animated});
      } else {
        const indexOffset = props.enableAll ? 1 : 0;
        headerListRef.current.scrollToIndex({
          index: day - 1 + indexOffset,
          viewPosition: 0.5,
          animated,
        });
      }
    },
    [cruiseDays, props.enableAll],
  );

  /**
   * Recenter whenever the selected day changes, including first layout and external
   * updates (shared ScheduleCruiseDayContext). First scroll is unanimated so the
   * header lands in place; later changes ease so a visible header still animates.
   */
  useEffect(() => {
    if (!headerListRef.current || !cruiseDays || cruiseDays.length === 0) {
      return;
    }

    const animated = hasCompletedInitialScroll.current;
    const rafId = requestAnimationFrame(() => {
      scrollHeaderToDay(safeSelectedDay, animated);
      hasCompletedInitialScroll.current = true;
    });

    return () => cancelAnimationFrame(rafId);
  }, [safeSelectedDay, cruiseDays, scrollHeaderToDay]);

  const renderItem = ({item}: {item: HeaderItem}) => {
    // Handle "All Days" button
    if ('isAllDays' in item && item.isAllDays) {
      const onPress = () => {
        if (props.selectedCruiseDay === 0 && props.scrollToNow) {
          props.scrollToNow();
        } else {
          props.setCruiseDay(0);
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
