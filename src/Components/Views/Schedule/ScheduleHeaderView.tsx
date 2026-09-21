import {FlashList, type FlashListRef} from '@shopify/flash-list';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {runOnJS, type SharedValue, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

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
  /**
   * Optional UI-thread mirror of the selected cruise day. A screen backed by a pager passes one
   * so the highlight switches the moment a drag crosses halfway, instead of waiting for the swipe
   * to settle and React to re-render. Callers without a pager omit it and get an internal value
   * that tracks selectedCruiseDay - the same behaviour as before.
   */
  liveSelectedDay?: SharedValue<number>;
}

type HeaderItem = CruiseDayData | {cruiseDay: 0; isAllDays: true};

export const ScheduleHeaderView = (props: ScheduleHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {cruiseDays} = useCruise();
  const headerListRef = useRef<FlashListRef<HeaderItem>>(null);
  const hasCompletedInitialScroll = useRef(false);

  const {leftShadowOpacity, rightShadowOpacity, handleScroll} = useScrollShadow();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        view: {
          position: 'relative',
          ...commonStyles.flexRow,
          ...commonStyles.paddingVerticalSmall,
        },
      }),
    [commonStyles],
  );

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

  // Used only when the caller has no pager to drive the highlight; snaps rather than crossfades.
  const internalSelectedDay = useSharedValue(props.selectedCruiseDay ?? 1);
  const liveSelectedDay = props.liveSelectedDay ?? internalSelectedDay;
  useEffect(() => {
    if (!props.liveSelectedDay) {
      internalSelectedDay.value = props.selectedCruiseDay ?? 1;
    }
  }, [props.selectedCruiseDay, props.liveSelectedDay, internalSelectedDay]);

  /**
   * Stable press handler shared by every chip, so the chips can be memoized. Reads the current
   * selection and callbacks from refs rather than closing over them, which would give this a new
   * identity on each render and defeat the memoization.
   */
  const latest = useRef({
    selectedCruiseDay: props.selectedCruiseDay,
    setCruiseDay: props.setCruiseDay,
    scrollToNow: props.scrollToNow,
  });
  useEffect(() => {
    latest.current = {
      selectedCruiseDay: props.selectedCruiseDay,
      setCruiseDay: props.setCruiseDay,
      scrollToNow: props.scrollToNow,
    };
  });

  const handleSelect = useCallback((cruiseDay: number) => {
    const {selectedCruiseDay, setCruiseDay, scrollToNow} = latest.current;
    if (cruiseDay === selectedCruiseDay && scrollToNow) {
      scrollToNow();
    } else {
      setCruiseDay(cruiseDay);
    }
  }, []);

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

  /**
   * With a pager driving the highlight, recentre the strip as soon as the drag crosses the
   * halfway point rather than waiting for the day to commit - otherwise the highlight is instant
   * but the strip it sits in still slides late. Fires once per crossing (one JS hop per swipe),
   * and the commit-driven effect above stays as the backstop.
   */
  const hasPagerSelection = !!props.liveSelectedDay;
  useAnimatedReaction(
    () => liveSelectedDay.value,
    (current, previous) => {
      if (!hasPagerSelection || previous === null || current === previous) {
        return;
      }
      runOnJS(scrollHeaderToDay)(current, true);
    },
    [hasPagerSelection, scrollHeaderToDay],
  );

  const renderItem = useCallback(
    ({item}: {item: HeaderItem}) => {
      if ('isAllDays' in item && item.isAllDays) {
        return <ScheduleHeaderAllButton liveSelectedDay={liveSelectedDay} onSelect={handleSelect} />;
      }
      // TypeScript knows this is CruiseDayData after the above check
      const cruiseDayItem = item as CruiseDayData;
      return (
        <ScheduleHeaderDayButton cruiseDay={cruiseDayItem} liveSelectedDay={liveSelectedDay} onSelect={handleSelect} />
      );
    },
    [liveSelectedDay, handleSelect],
  );

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
