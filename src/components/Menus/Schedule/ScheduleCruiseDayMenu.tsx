import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {format} from 'date-fns';
import {
  ScheduleStackComponents,
  ScheduleStackParamList,
  useScheduleStackNavigation,
} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {RouteProp} from '@react-navigation/native';
import {CruiseDayMenuItem} from '../Items/CruiseDayMenuItem.tsx';

interface ScheduleCruiseDayMenuProps {
  scrollToNow: () => void;
  screen: ScheduleStackComponents.eventDayScreen | ScheduleStackComponents.eventYourDayScreen;
  route: RouteProp<
    ScheduleStackParamList,
    ScheduleStackComponents.eventDayScreen | ScheduleStackComponents.eventYourDayScreen
  >;
}

export const ScheduleCruiseDayMenu = ({scrollToNow, route, screen}: ScheduleCruiseDayMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const navigation = useScheduleStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    navigation.navigate(screen, {cruiseDay: newCruiseDay});
    closeMenu();
  };

  const navigateToday = () => {
    if (route.params.cruiseDay === adjustedCruiseDayToday) {
      scrollToNow();
      return;
    }
    navigation.navigate(screen, {cruiseDay: adjustedCruiseDayToday});
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
