import {format} from 'date-fns';
import React from 'react';

import {ScheduleHeaderButton} from '#src/Components/Buttons/ScheduleHeaderButton';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {CruiseDayData} from '#src/Types';

interface ScheduleHeaderDayViewProps {
  cruiseDay: CruiseDayData;
  isSelectedDay?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const ScheduleHeaderDayButton = (props: ScheduleHeaderDayViewProps) => {
  const {adjustedCruiseDayToday} = useCruise();
  const isToday = props.cruiseDay.cruiseDay === adjustedCruiseDayToday;

  return (
    <ScheduleHeaderButton
      isSelected={props.isSelectedDay}
      onPress={props.onPress}
      disabled={props.disabled}
      primaryText={format(props.cruiseDay.date, 'EEE')}
      secondaryText={format(props.cruiseDay.date, 'MMM dd')}
      underlinePrimary={isToday}
    />
  );
};
