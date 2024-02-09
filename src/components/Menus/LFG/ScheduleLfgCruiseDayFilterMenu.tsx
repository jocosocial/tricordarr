import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {format} from 'date-fns';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ScheduleLfgCruiseDayFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const {lfgCruiseDayFilter, setLfgCruiseDayFilter} = useFilter();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

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
          <Menu.Item
            style={lfgCruiseDayFilter === day.cruiseDay ? commonStyles.surfaceVariant : undefined}
            key={day.cruiseDay}
            onPress={() => handleCruiseDaySelection(day.cruiseDay)}
            title={`${format(day.date, 'EEEE')}${adjustedCruiseDayToday === day.cruiseDay ? ' (Today)' : ''}`}
            trailingIcon={lfgCruiseDayFilter === day.cruiseDay ? AppIcons.check : undefined}
          />
        );
      })}
    </Menu>
  );
};
