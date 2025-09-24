import {format} from 'date-fns';
import React from 'react';

import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';

export const LfgCruiseDayFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {cruiseDays, adjustedCruiseDayToday} = useCruise();
  const {lfgCruiseDayFilter, setLfgCruiseDayFilter} = useFilter();

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
    <MenuAnchor
      title={'Cruise Day'}
      active={lfgCruiseDayFilter !== undefined}
      iconName={AppIcons.cruiseDay}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </AppHeaderMenu>
  );
};
