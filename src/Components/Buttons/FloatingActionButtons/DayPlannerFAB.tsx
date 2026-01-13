import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';

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
