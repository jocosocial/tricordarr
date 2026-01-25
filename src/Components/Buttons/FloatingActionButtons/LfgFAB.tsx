import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {LfgStackComponents, useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {FezListEndpoints} from '#src/Types';

interface LfgFABProps {
  showLabel?: boolean;
  endpoint: FezListEndpoints;
  setEndpoint: (endpoint: FezListEndpoints) => void;
}

export const LfgFAB = (props: LfgFABProps) => {
  const navigation = useLFGStackNavigation();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});

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
      onPress: () => navigation.push(LfgStackComponents.lfgCreateScreen),
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
