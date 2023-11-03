import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {TextStyle} from 'react-native';
import {useCruise} from '../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {useScheduleStack, useScheduleStackRoute} from '../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../libraries/Enums/Navigation';

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
}

export const ScheduleCruiseDayMenu = ({scrollToNow}: ScheduleCruiseDayMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, cruiseDayToday} = useCruise();
  const navigation = useScheduleStack();
  const route = useScheduleStackRoute();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    navigation.push(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: newCruiseDay});
    closeMenu();
  };

  const navigateToday = () => {
    if (route.params.cruiseDay === cruiseDayToday) {
      console.log('Navigating to same day.');
      scrollToNow();
      return;
    }
    navigation.navigate(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: cruiseDayToday});
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
