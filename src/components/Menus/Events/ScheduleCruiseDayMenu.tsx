import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {TextStyle} from 'react-native';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {EventStackParamList, useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp} from '@react-navigation/native';

interface CruiseDayMenuItemProps {
  handleSelection: (i: number) => void;
  title: string;
  currentCruiseDay: number;
  itemCruiseDay: number;
}

const CruiseDayMenuItem = ({handleSelection, title, currentCruiseDay, itemCruiseDay}: CruiseDayMenuItemProps) => {
  const titleStyle: TextStyle = {
    fontWeight: currentCruiseDay === itemCruiseDay ? 'bold' : 'normal',
  };
  return <Menu.Item titleStyle={titleStyle} title={title} onPress={() => handleSelection(itemCruiseDay)} />;
};

interface ScheduleCruiseDayMenuProps {
  scrollToNow: () => void;
  route: RouteProp<EventStackParamList, EventStackComponents.eventDayScreen>;
}

export const ScheduleCruiseDayMenu = ({scrollToNow, route}: ScheduleCruiseDayMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, cruiseDayToday} = useCruise();
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    navigation.navigate(EventStackComponents.eventDayScreen, {cruiseDay: newCruiseDay});
    closeMenu();
  };

  const navigateToday = () => {
    if (route.params.cruiseDay === cruiseDayToday) {
      console.log('Navigating to same day.');
      scrollToNow();
      return;
    }
    navigation.navigate(EventStackComponents.eventDayScreen, {cruiseDay: cruiseDayToday});
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
          title={`${format(day.date, 'EEEE')}${cruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
          currentCruiseDay={route.params.cruiseDay}
          itemCruiseDay={day.cruiseDay}
        />
      ))}
    </Menu>
  );
};
