import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventStackNavigation, useEventStackRoute} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFAB} from './BaseFAB';

export const EventFAB = () => {
  const navigation = useEventStackNavigation();
  const route = useEventStackRoute();

  const handleNavigation = (component: EventStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const actions = [
    FabGroupAction({
      icon: AppIcons.favorite,
      label: 'Favorites',
      onPress: () => handleNavigation(EventStackComponents.eventFavoritesScreen),
    }),
    FabGroupAction({
      icon: AppIcons.eventSearch,
      label: 'Search',
      onPress: () => handleNavigation(EventStackComponents.eventSearchScreen),
    }),
  ];

  return <BaseFAB actions={actions} openLabel={'Events'} icon={AppIcons.events} />;
};
