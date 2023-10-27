import * as React from 'react';
import {Dispatch, SetStateAction, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {TextStyle} from 'react-native';
import {useCruise} from '../Context/Contexts/CruiseContext';

interface ScheduleCruiseDayMenuProps {
  cruiseDay: number;
  setCruiseDay: Dispatch<SetStateAction<number>>;
}

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

// @TODO autogenerate the days based on the cruisestartdayofweek so we dont have to deal with Sunday vs Saturday.
export const ScheduleCruiseDayMenu = () => {
  const [visible, setVisible] = useState(false);
  const {cruiseDay, setCruiseDay} = useCruise();

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
      <CruiseDayMenuItem
        title={'Sunday'}
        itemCruiseDay={1}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Monday'}
        itemCruiseDay={2}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Tuesday'}
        itemCruiseDay={3}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Wednesday'}
        itemCruiseDay={4}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Thursday'}
        itemCruiseDay={5}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Friday'}
        itemCruiseDay={6}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Saturday'}
        itemCruiseDay={7}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
      <CruiseDayMenuItem
        title={'Sunday'}
        itemCruiseDay={8}
        currentCruiseDay={cruiseDay}
        handleSelection={handleCruiseDaySelection}
      />
    </Menu>
  );
};
