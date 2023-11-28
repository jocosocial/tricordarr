import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventStackNavigation, useEventStackRoute} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useFilter} from '../../Context/Contexts/FilterContext';

export const EventFAB = () => {
  const navigation = useEventStackNavigation();
  const route = useEventStackRoute();
  const {cruiseDayToday} = useCruise();
  const {setEventFavoriteFilter} = useFilter();

  const handleNavigation = (component: EventStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const handleYourDay = () => {
    setEventFavoriteFilter(true);
    navigation.push(EventStackComponents.eventDayScreen, {cruiseDay: cruiseDayToday});
  };

  const actions = [
    FabGroupAction({
      icon: AppIcons.user,
      label: 'Your Day Today',
      onPress: handleYourDay,
    }),
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

  return <BaseFABGroup actions={actions} openLabel={'Events'} icon={AppIcons.events} />;
};
