import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventStackNavigation, useEventStackRoute} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

export const ScheduleFAB = () => {
  const navigation = useEventStackNavigation();
  const route = useEventStackRoute();

  const handleNavigation = (component: EventStackComponents | CommonStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'Create Personal Event',
      onPress: () => handleNavigation(CommonStackComponents.personalEventCreateScreen),
    }),
    FabGroupAction({
      icon: AppIcons.favorite,
      label: 'Favorite Events',
      onPress: () => handleNavigation(EventStackComponents.eventFavoritesScreen),
    }),
    FabGroupAction({
      icon: AppIcons.personalEvent,
      label: 'Personal Events',
      onPress: () => handleNavigation(EventStackComponents.personalEventListScreen),
    }),
    FabGroupAction({
      icon: AppIcons.eventSearch,
      label: 'Search',
      onPress: () => handleNavigation(EventStackComponents.eventSearchScreen),
    }),
  ];

  return <BaseFABGroup actions={actions} openLabel={'Schedule'} icon={AppIcons.events} />;
};
