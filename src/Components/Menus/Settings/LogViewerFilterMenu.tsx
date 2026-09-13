import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useMenu} from '#src/Hooks/useMenu';
import {LogLevel} from '#src/Libraries/Logger/types';

export type LogViewerLevelFilter = LogLevel | 'all';
export type LogViewerTimeFilter = 'all' | '1h' | '24h';

interface LogViewerFilterMenuProps {
  levelFilter: LogViewerLevelFilter;
  setLevelFilter: (value: LogViewerLevelFilter) => void;
  timeFilter: LogViewerTimeFilter;
  setTimeFilter: (value: LogViewerTimeFilter) => void;
}

const levelOptions: {value: LogViewerLevelFilter; label: string}[] = [
  {value: 'all', label: 'All Levels'},
  {value: LogLevel.DEBUG, label: 'Debug'},
  {value: LogLevel.INFO, label: 'Info'},
  {value: LogLevel.WARN, label: 'Warn'},
  {value: LogLevel.ERROR, label: 'Error'},
];

const timeOptions: {value: LogViewerTimeFilter; label: string}[] = [
  {value: 'all', label: 'All Time'},
  {value: '1h', label: 'Last Hour'},
  {value: '24h', label: 'Last 24 Hours'},
];

export const LogViewerFilterMenu = ({
  levelFilter,
  setLevelFilter,
  timeFilter,
  setTimeFilter,
}: LogViewerFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const clearFilters = () => {
    setLevelFilter('all');
    setTimeFilter('all');
  };

  const handleLevelSelection = (value: LogViewerLevelFilter) => {
    setLevelFilter(value);
    closeMenu();
  };

  const handleTimeSelection = (value: LogViewerTimeFilter) => {
    setTimeFilter(value);
    closeMenu();
  };

  const anyActiveFilter = levelFilter !== 'all' || timeFilter !== 'all';

  const menuAnchor = <FilterMenuAnchor active={anyActiveFilter} onPress={openMenu} onLongPress={clearFilters} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {levelOptions.map(option => (
        <SelectableMenuItem
          key={option.value}
          title={option.label}
          selected={levelFilter === option.value}
          onPress={() => handleLevelSelection(option.value)}
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
