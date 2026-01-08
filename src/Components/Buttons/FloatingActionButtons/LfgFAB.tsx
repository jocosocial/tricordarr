import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {LfgStackComponents, useLFGStackNavigation, useLFGStackRoute} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

interface LfgFABProps {
  showLabel?: boolean;
}

export const LfgFAB = (props: LfgFABProps) => {
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});

  const handleNavigation = (component: LfgStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const badgeCount = getBadgeDisplayValue(userNotificationData?.newFezMessageCount);
  const joinedLabel = badgeCount ? `Joined (${badgeCount})` : 'Joined';

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'New LFG',
      onPress: () => handleNavigation(LfgStackComponents.lfgCreateScreen),
    }),
    FabGroupAction({
      icon: AppIcons.lfgFind,
      label: 'Find',
      onPress: () => handleNavigation(LfgStackComponents.lfgFindScreen),
    }),
    FabGroupAction({
      icon: AppIcons.lfgJoined,
      label: joinedLabel,
      onPress: () => handleNavigation(LfgStackComponents.lfgJoinedScreen),
    }),
    FabGroupAction({
      icon: AppIcons.lfgOwned,
      label: 'Owned',
      onPress: () => handleNavigation(LfgStackComponents.lfgOwnedScreen),
    }),
  ];

  return (
    <BaseFABGroup actions={actions} openLabel={'Looking For Group'} icon={AppIcons.lfg} showLabel={props.showLabel} />
  );
};
