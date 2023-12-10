import * as React from 'react';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventStackNavigation, useEventStackRoute} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {BaseFABGroup} from './BaseFABGroup';
import {useCruise} from '../../Context/Contexts/CruiseContext';

export const EventFAB = () => {
  const navigation = useEventStackNavigation();
  const route = useEventStackRoute();
  const {adjustedCruiseDayToday} = useCruise();

  const handleNavigation = (component: EventStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  const handleYourDay = () => {
    // setEventFavoriteFilter(true);
    // navigation.push(EventStackComponents.eventDayScreen, {cruiseDay: adjustedCruiseDayToday});
    navigation.push(EventStackComponents.eventYourDayScreen, {cruiseDay: adjustedCruiseDayToday});
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
