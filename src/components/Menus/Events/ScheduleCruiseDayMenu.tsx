import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {EventStackParamList, useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp} from '@react-navigation/native';
import {CruiseDayMenuItem} from '../Items/CruiseDayMenuItem';

interface ScheduleCruiseDayMenuProps {
  scrollToNow: () => void;
  route: RouteProp<EventStackParamList, EventStackComponents.eventDayScreen>;
}

export const ScheduleCruiseDayMenu = ({scrollToNow, route}: ScheduleCruiseDayMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    navigation.navigate(EventStackComponents.eventDayScreen, {cruiseDay: newCruiseDay});
    closeMenu();
  };

  const navigateToday = () => {
    if (route.params.cruiseDay === adjustedCruiseDayToday) {
      scrollToNow();
      return;
    }
    navigation.navigate(EventStackComponents.eventDayScreen, {cruiseDay: adjustedCruiseDayToday});
  };

  const menuAnchor = (
    <Item title={'Cruise Day'} iconName={AppIcons.cruiseDay} onPress={navigateToday} onLongPress={openMenu} />
  );

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {cruiseDays.map(day => (
        <CruiseDayMenuItem
          key={day.cruiseDay}
          handleSelection={handleCruiseDaySelection}
          title={`${format(day.date, 'EEEE')}${adjustedCruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
          currentCruiseDay={route.params.cruiseDay}
          itemCruiseDay={day.cruiseDay}
        />
      ))}
    </Menu>
  );
};
