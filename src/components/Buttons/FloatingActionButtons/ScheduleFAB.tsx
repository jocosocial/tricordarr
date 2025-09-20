import * as React from 'react';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';

interface ScheduleFABProps {
  selectedDay?: number;
  showLabel?: boolean;
}

export const ScheduleFAB = (props: ScheduleFABProps) => {
  const navigation = useScheduleStackNavigation();

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'Create Personal Event',
      onPress: () =>
        navigation.push(CommonStackComponents.personalEventCreateScreen, {
          cruiseDay: props.selectedDay,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.personalEvent,
      label: 'Personal Events',
      onPress: () => navigation.push(CommonStackComponents.schedulePrivateEventsScreen),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Schedule'} icon={AppIcons.events} showLabel={props.showLabel} />;
};
