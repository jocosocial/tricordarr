import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';

interface DayPlannerFABProps {
  selectedDay?: number;
}

export const DayPlannerFAB = ({selectedDay}: DayPlannerFABProps) => {
  const navigation = useScheduleStackNavigation();

  return (
    <BaseFAB
      icon={AppIcons.dayPlanner}
      label={'Day Planner'}
      showLabel={true}
      onPress={() => navigation.push(CommonStackComponents.scheduleDayPlannerScreen, {cruiseDay: selectedDay})}
    />
  );
};
