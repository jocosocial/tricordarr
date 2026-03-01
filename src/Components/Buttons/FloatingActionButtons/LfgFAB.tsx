import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {LfgStackComponents, useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {FezListEndpoints} from '#src/Types';

interface LfgFABProps {
  showLabel?: boolean;
  endpoint: FezListEndpoints;
  setEndpoint: (endpoint: FezListEndpoints) => void;
  /** Cruise day filter from list; 0 = "All". When 0 or undefined, create screen uses current day. */
  cruiseDay?: number;
}

export const LfgFAB = (props: LfgFABProps) => {
  const navigation = useLFGStackNavigation();
  const {adjustedCruiseDayToday} = useCruise();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});

  const effectiveCruiseDay =
    props.cruiseDay === 0 || props.cruiseDay === undefined ? adjustedCruiseDayToday : props.cruiseDay;

  const handleEndpointChange = (newEndpoint: FezListEndpoints) => {
    if (props.endpoint === newEndpoint) {
      return;
    }
    props.setEndpoint(newEndpoint);
  };

  const badgeCount = getBadgeDisplayValue(userNotificationData?.newFezMessageCount);
  const joinedLabel = badgeCount ? `Joined (${badgeCount})` : 'Joined';

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'New LFG',
      onPress: () => navigation.push(LfgStackComponents.lfgCreateScreen, {cruiseDay: effectiveCruiseDay}),
    }),
    FabGroupAction({
      icon: AppIcons.lfgFind,
      label: 'Find',
      onPress: () => handleEndpointChange('open'),
    }),
    FabGroupAction({
      icon: AppIcons.lfgJoined,
      label: joinedLabel,
      onPress: () => handleEndpointChange('joined'),
    }),
    FabGroupAction({
      icon: AppIcons.lfgOwned,
      label: 'Owned',
      onPress: () => handleEndpointChange('owner'),
    }),
  ];

  return (
    <BaseFABGroup actions={actions} openLabel={'Looking For Group'} icon={AppIcons.lfg} showLabel={props.showLabel} />
  );
};
