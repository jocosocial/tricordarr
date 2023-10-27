import * as React from 'react';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {TextStyle} from 'react-native';
import {useCruise} from '../Context/Contexts/CruiseContext';

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

export const ScheduleCruiseDayMenu = () => {
  const [visible, setVisible] = useState(false);
  const {cruiseDay, setCruiseDay, cruiseDays, cruiseDayToday} = useCruise();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    setCruiseDay(newCruiseDay);
    closeMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Cruise Day'} iconName={AppIcons.cruiseDay} onPress={openMenu} />}>
      {cruiseDays.map(day => (
        <CruiseDayMenuItem
          key={day.cruiseDay}
          handleSelection={handleCruiseDaySelection}
          title={`${day.dayName}${cruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
          currentCruiseDay={cruiseDay}
          itemCruiseDay={day.cruiseDay}
        />
      ))}
    </Menu>
  );
};
