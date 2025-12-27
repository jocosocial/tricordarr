import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';

interface ScheduleFABProps {
  selectedDay?: number;
  showLabel?: boolean;
}

export const ScheduleFAB = (props: ScheduleFABProps) => {
  const navigation = useScheduleStackNavigation();

  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.scheduleDayPlannerScreen, {cruiseDay: props.selectedDay})}
      label={'Day Planner'}
      showLabel={props.showLabel}
      icon={AppIcons.dayPlanner}
    />
  );
};
