import * as React from 'react';

import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import { BaseFABGroup } from './BaseFABGroup';
import { FabGroupAction } from './FABGroupAction';

interface ScheduleFABProps {
  selectedDay?: number;
  showLabel?: boolean;
}

export const ScheduleFAB = (props: ScheduleFABProps) => {
  const navigation = useScheduleStackNavigation();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});

  const badgeCount = getBadgeDisplayValue(userNotificationData?.newPrivateEventMessageCount);
  const personalEventsLabel = badgeCount ? `Personal Events (${badgeCount})` : 'Personal Events';

  const actions = [
    FabGroupAction({
      icon: AppIcons.dayPlanner,
      label: 'Day Planner',
      onPress: () =>
        navigation.push(CommonStackComponents.scheduleDayPlannerScreen, {
          cruiseDay: props.selectedDay,
        }),
    }),
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
      label: personalEventsLabel,
      onPress: () => navigation.push(CommonStackComponents.schedulePrivateEventsScreen),
    }),
  ];

  return (
    <BaseFABGroup
      actions={actions}
      openLabel={'Schedule'}
      icon={AppIcons.events}
      showLabel={props.showLabel}
    />
  );
};
