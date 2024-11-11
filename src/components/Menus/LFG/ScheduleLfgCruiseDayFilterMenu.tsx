import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';

export const ScheduleLfgCruiseDayFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const {lfgCruiseDayFilter, setLfgCruiseDayFilter} = useFilter();
  const theme = useAppTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleCruiseDaySelection = (newCruiseDay: number) => {
    if (newCruiseDay === lfgCruiseDayFilter) {
      setLfgCruiseDayFilter(undefined);
    } else {
      setLfgCruiseDayFilter(newCruiseDay);
    }
    closeMenu();
  };

  const clearFilters = () => {
    setLfgCruiseDayFilter(undefined);
  };

  const menuAnchor = (
    <Item
      title={'Cruise Day'}
      color={lfgCruiseDayFilter !== undefined ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.cruiseDay}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {cruiseDays.map(day => {
        return (
          <SelectableMenuItem
            title={`${format(day.date, 'EEEE')}${adjustedCruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
            onPress={() => handleCruiseDaySelection(day.cruiseDay)}
            key={day.cruiseDay}
            selected={lfgCruiseDayFilter === day.cruiseDay}
          />
        );
      })}
    </Menu>
  );
};
