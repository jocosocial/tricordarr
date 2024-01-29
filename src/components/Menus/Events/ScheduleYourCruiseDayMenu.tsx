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
import {useAppTheme} from '../../../styles/Theme';

interface ScheduleCruiseDayMenuProps {
  route: RouteProp<EventStackParamList, EventStackComponents.eventYourDayScreen>;
}

export const ScheduleYourCruiseDayMenu = ({route}: ScheduleCruiseDayMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const navigation = useEventStackNavigation();
  const theme = useAppTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    navigation.navigate(EventStackComponents.eventYourDayScreen, {cruiseDay: newCruiseDay});
    closeMenu();
  };

  const handleCruiseDayToday = () =>
    navigation.navigate(EventStackComponents.eventYourDayScreen, {cruiseDay: adjustedCruiseDayToday});

  const menuAnchor = (
    <Item
      title={'Cruise Day'}
      iconName={AppIcons.cruiseDay}
      color={route.params.cruiseDay !== adjustedCruiseDayToday ? theme.colors.twitarrNeutralButton : undefined}
      onPress={openMenu}
      onLongPress={handleCruiseDayToday}
    />
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
