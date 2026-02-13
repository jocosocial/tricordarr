import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import useDateTime from '#src/Libraries/DateTime';
import {DAY_PLANNER_CONFIG, getMinutesFromDayStartForNow} from '#src/Libraries/DayPlanner';

interface DayPlannerNowDividerProps {
  /** Start of the displayed day (for pixel offset calculation) */
  dayStart: Date;
  /** The cruise day being viewed (1-indexed) */
  selectedCruiseDay: number | undefined;
  /** Boat timezone for the selected day (must match timeline labels and scroll-to-now). */
  boatTimeZoneID: string;
}

/**
 * Renders a "now" indicator on the day planner timeline when viewing today's
 * effective cruise day. Uses the same logic as getScrollOffsetForTimeOfDay
 * so the line and "scroll to now" stay in sync.
 */
export const DayPlannerNowDivider = ({dayStart, selectedCruiseDay, boatTimeZoneID}: DayPlannerNowDividerProps) => {
  const {theme} = useAppTheme();
  const {startDate, endDate, adjustedCruiseDayToday} = useCruise();

  const minutelyUpdatingDate = useDateTime('minute');

  const nowLineOffset = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }

    if (
      selectedCruiseDay === undefined ||
      adjustedCruiseDayToday === undefined ||
      selectedCruiseDay !== adjustedCruiseDayToday
    ) {
      return null;
    }

    const minutesFromDayStart = getMinutesFromDayStartForNow(boatTimeZoneID, dayStart, minutelyUpdatingDate);
    if (minutesFromDayStart === null) {
      return null;
    }

    return (minutesFromDayStart / DAY_PLANNER_CONFIG.MINUTES_PER_ROW) * DAY_PLANNER_CONFIG.ROW_HEIGHT;
  }, [minutelyUpdatingDate, selectedCruiseDay, adjustedCruiseDayToday, startDate, endDate, dayStart, boatTimeZoneID]);

  if (nowLineOffset === null) {
    return null;
  }

  const styles = StyleSheet.create({
    nowLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: theme.colors.error,
      zIndex: 0,
    },
  });

  return <View style={[styles.nowLine, {top: nowLineOffset}]} />;
};
