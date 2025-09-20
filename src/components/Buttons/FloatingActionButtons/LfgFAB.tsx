import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../Libraries/Enums/Icons';
import {LfgStackComponents, useLFGStackNavigation, useLFGStackRoute} from '../../Navigation/Stacks/LFGStackNavigator';
import {BaseFABGroup} from './BaseFABGroup';

interface LfgFABProps {
  showLabel?: boolean;
}

export const LfgFAB = (props: LfgFABProps) => {
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();

  const handleNavigation = (component: LfgStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

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
      label: 'Joined',
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
