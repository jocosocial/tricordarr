import {format} from 'date-fns';
import React from 'react';
import type {SharedValue} from 'react-native-reanimated';

import {ScheduleHeaderButton} from '#src/Components/Buttons/ScheduleHeaderButton';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {CruiseDayData} from '#src/Types';

interface ScheduleHeaderDayViewProps {
  cruiseDay: CruiseDayData;
  liveSelectedDay: SharedValue<number>;
  /** Stable across renders so this component's React.memo actually holds. */
  onSelect: (cruiseDay: number) => void;
  disabled?: boolean;
}

const ScheduleHeaderDayButtonComponent = (props: ScheduleHeaderDayViewProps) => {
  const {adjustedCruiseDayToday} = useCruise();
  const isToday = props.cruiseDay.cruiseDay === adjustedCruiseDayToday;

  return (
    <ScheduleHeaderButton
      liveSelectedDay={props.liveSelectedDay}
      cruiseDay={props.cruiseDay.cruiseDay}
      onSelect={props.onSelect}
      disabled={props.disabled}
      primaryText={format(props.cruiseDay.date, 'EEE')}
      secondaryText={format(props.cruiseDay.date, 'MMM dd')}
      underlinePrimary={isToday}
      testID={`scheduleHeaderDay${props.cruiseDay.cruiseDay}-button`}
    />
  );
};

export const ScheduleHeaderDayButton = React.memo(ScheduleHeaderDayButtonComponent);
