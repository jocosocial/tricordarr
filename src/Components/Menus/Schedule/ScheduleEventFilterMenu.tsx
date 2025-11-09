import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';

export const ScheduleEventFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {
    eventTypeFilter,
    setEventTypeFilter,
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventPersonalFilter,
    setEventPersonalFilter,
    eventLfgFilter,
    setEventLfgFilter,
  } = useFilter();
  const {oobeCompleted} = useConfig();

  // This also shows joined LFGs, hopefully that's not too surprising
  const handleFavoriteSelection = () => {
    setEventFavoriteFilter(!eventFavoriteFilter);
    closeMenu();
  };

  const handlePersonalSelection = () => {
    setEventPersonalFilter(!eventPersonalFilter);
    closeMenu();
  };

  const handleLfgSelection = () => {
    setEventLfgFilter(!eventLfgFilter);
    closeMenu();
  };

  const handleFilterSelection = (newEventTypeFilter: string) => {
    if (newEventTypeFilter === eventTypeFilter) {
      setEventTypeFilter('');
    } else {
      setEventTypeFilter(newEventTypeFilter);
    }
    closeMenu();
  };

  const clearFilters = () => {
    setEventTypeFilter('');
    setEventFavoriteFilter(false);
    setEventLfgFilter(false);
    setEventPersonalFilter(false);
  };

  const anyActiveFilter = eventFavoriteFilter || eventTypeFilter || eventPersonalFilter || eventLfgFilter;

  const menuAnchor = (
    <MenuAnchor
      active={!!anyActiveFilter}
      title={'Filter'}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem title={'Favorite Events'} onPress={handleFavoriteSelection} selected={eventFavoriteFilter} />
      <SelectableMenuItem
        title={'Personal Events'}
        onPress={handlePersonalSelection}
        selected={eventPersonalFilter}
        disabled={!oobeCompleted}
      />
      <SelectableMenuItem
        title={'LFGs'}
        onPress={handleLfgSelection}
        selected={eventLfgFilter}
        disabled={!oobeCompleted}
      />
      <Divider bold={true} />
      {Object.keys(EventType).map(eventType => {
        return (
          <SelectableMenuItem
            key={eventType}
            title={EventType[eventType as keyof typeof EventType]}
            onPress={() => handleFilterSelection(eventType)}
            selected={eventTypeFilter === eventType}
          />
        );
      })}
    </AppMenu>
  );
};
