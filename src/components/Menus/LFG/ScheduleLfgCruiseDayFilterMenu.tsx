import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ViewStyle} from 'react-native';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';

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

  const activeStyle: ViewStyle = {backgroundColor: theme.colors.surfaceVariant};

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {cruiseDays.map(day => {
        const itemStyle = lfgCruiseDayFilter === day.cruiseDay ? activeStyle : undefined;
        return (
          <Menu.Item
            style={itemStyle}
            key={day.cruiseDay}
            onPress={() => handleCruiseDaySelection(day.cruiseDay)}
            title={`${format(day.date, 'EEEE')}${adjustedCruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
          />
        );
      })}
    </Menu>
  );
};
