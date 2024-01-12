import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useLFGStackNavigation, useLFGStackRoute} from '../../Navigation/Stacks/LFGStackNavigator';
import {BaseFABGroup} from './BaseFABGroup';

export const LfgFAB = () => {
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
    FabGroupAction({
      icon: AppIcons.help,
      label: 'Help',
      onPress: () => handleNavigation(LfgStackComponents.lfgHelpScreen),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Looking For Group'} icon={AppIcons.lfg} />;
};
