import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useScheduleStackNavigation} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {BaseFABGroup} from './BaseFABGroup';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

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
