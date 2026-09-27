import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useMenu} from '#src/Hooks/useMenu';

export type NotificationLogTypeFilter = string | 'all';
export type NotificationLogTimeFilter = 'all' | '1h' | '24h';

interface NotificationLogTypeOption {
  value: string;
  label: string;
}

interface NotificationLogFilterMenuProps {
  typeFilter: NotificationLogTypeFilter;
  setTypeFilter: (value: NotificationLogTypeFilter) => void;
  timeFilter: NotificationLogTimeFilter;
  setTimeFilter: (value: NotificationLogTimeFilter) => void;
  /** Type options actually present in the loaded entries, sorted by display label. */
  typeOptions: NotificationLogTypeOption[];
}

const timeOptions: {value: Exclude<NotificationLogTimeFilter, 'all'>; label: string}[] = [
  {value: '1h', label: 'Last Hour'},
  {value: '24h', label: 'Last 24 Hours'},
];

/**
 * Header filter menu for NotificationLogScreen. The type filter's options are derived from
 * whatever types are actually present in the loaded log (passed in as `typeOptions`), since
 * hardcoding all ~20 NotificationTypeData values would make the menu unusable.
 *
 * There is no explicit "All Types" / "All Time" row: no filter selected already means "all",
 * so an "all" entry would just be a confusing second way to say the same thing. Long-pressing
 * the anchor clears back to that state.
 */
export const NotificationLogFilterMenu = ({
  typeFilter,
  setTypeFilter,
  timeFilter,
  setTimeFilter,
  typeOptions,
}: NotificationLogFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const clearFilters = () => {
    setTypeFilter('all');
    setTimeFilter('all');
  };

  const handleTypeSelection = (value: string) => {
    setTypeFilter(value === typeFilter ? 'all' : value);
    closeMenu();
  };

  const handleTimeSelection = (value: Exclude<NotificationLogTimeFilter, 'all'>) => {
    setTimeFilter(value === timeFilter ? 'all' : value);
    closeMenu();
  };

  const anyActiveFilter = typeFilter !== 'all' || timeFilter !== 'all';

  const menuAnchor = <FilterMenuAnchor active={anyActiveFilter} onPress={openMenu} onLongPress={clearFilters} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {typeOptions.map(option => (
        <SelectableMenuItem
          key={option.value}
          title={option.label}
          selected={typeFilter === option.value}
          onPress={() => handleTypeSelection(option.value)}
        />
      ))}
      <Divider bold={true} />
      {timeOptions.map(option => (
        <SelectableMenuItem
          key={option.value}
          title={option.label}
          selected={timeFilter === option.value}
          onPress={() => handleTimeSelection(option.value)}
        />
      ))}
    </AppMenu>
  );
};
