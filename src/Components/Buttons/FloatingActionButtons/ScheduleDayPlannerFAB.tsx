import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';

interface ScheduleDayPlannerFABProps {
  /** Cruise day currently shown in Day Planner; used to pre-fill create screens. */
  cruiseDay: number;
}

/**
 * Expanding FAB on Day Planner for creating a private event or LFG on the selected day.
 */
export const ScheduleDayPlannerFAB = ({cruiseDay}: ScheduleDayPlannerFABProps) => {
  const navigation = useScheduleStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.eventCreate,
      label: 'Personal Event',
      onPress: () =>
        navigation.push(CommonStackComponents.personalEventCreateScreen, {
          cruiseDay,
        }),
      testID: 'dayPlannerPrivate-fab',
    }),
    FabGroupAction({
      icon: AppIcons.lfgCreate,
      label: 'LFG',
      onPress: () =>
        navigation.push(CommonStackComponents.lfgCreateScreen, {
          cruiseDay,
        }),
      testID: 'dayPlannerLfg-fab',
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'New'} icon={AppIcons.new} testID={'dayPlanner-fab'} />;
};
