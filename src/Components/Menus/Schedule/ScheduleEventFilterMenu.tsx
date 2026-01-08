import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';

export const ScheduleEventFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {
    eventTypeFilter,
    setEventTypeFilter,
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventPersonalFilter,
    setEventPersonalFilter,
    eventLfgJoinedFilter,
    setEventLfgJoinedFilter,
    eventLfgOwnedFilter,
    setEventLfgOwnedFilter,
    eventLfgOpenFilter,
    setEventLfgOpenFilter,
    eventShutternautFilter,
    setEventShutternautFilter,
  } = useFilter();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {hasShutternaut} = useRoles();

  // This also shows joined LFGs, hopefully that's not too surprising
  const handleFavoriteSelection = () => {
    setEventFavoriteFilter(!eventFavoriteFilter);
    closeMenu();
  };

  const handlePersonalSelection = () => {
    setEventPersonalFilter(!eventPersonalFilter);
    closeMenu();
  };

  const handleLfgJoinedSelection = () => {
    setEventLfgJoinedFilter(!eventLfgJoinedFilter);
    closeMenu();
  };

  const handleLfgOwnedSelection = () => {
    setEventLfgOwnedFilter(!eventLfgOwnedFilter);
    closeMenu();
  };

  const handleLfgOpenSelection = () => {
    setEventLfgOpenFilter(!eventLfgOpenFilter);
    closeMenu();
  };

  /**
   * This mirrors the implementation on the Site UI of doing the filtering in JS
   * rather than passing through to the API. Some day we may want to do that. Lets
   * see how it goes in 2026 first.
   */
  const handleShutternautFilterSelection = (filterValue: string) => {
    if (eventShutternautFilter === filterValue) {
      setEventShutternautFilter(undefined);
    } else {
      setEventShutternautFilter(filterValue);
    }
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
    setEventLfgJoinedFilter(false);
    setEventLfgOwnedFilter(false);
    setEventLfgOpenFilter(false);
    setEventPersonalFilter(false);
    setEventShutternautFilter(undefined);
  };

  const anyActiveFilter =
    eventFavoriteFilter ||
    eventTypeFilter ||
    eventPersonalFilter ||
    eventLfgJoinedFilter ||
    eventLfgOwnedFilter ||
    eventLfgOpenFilter ||
    eventShutternautFilter !== undefined;

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
      <Divider bold={true} />
      <SelectableMenuItem
        title={'Joined LFGs'}
        onPress={handleLfgJoinedSelection}
        selected={eventLfgJoinedFilter}
        disabled={!oobeCompleted}
      />
      <SelectableMenuItem
        title={'Your LFGs'}
        onPress={handleLfgOwnedSelection}
        selected={eventLfgOwnedFilter}
        disabled={!oobeCompleted}
      />
      {appConfig.schedule.eventsShowOpenLfgs && (
        <SelectableMenuItem
          title={'Open LFGs'}
          onPress={handleLfgOpenSelection}
          selected={eventLfgOpenFilter}
          disabled={!oobeCompleted}
        />
      )}
      {hasShutternaut && (
        <>
          <Divider bold={true} />
          <SelectableMenuItem
            title={"You're Photographing"}
            onPress={() => handleShutternautFilterSelection('imphotographer')}
            selected={eventShutternautFilter === 'imphotographer'}
          />
          <SelectableMenuItem
            title={'No Photographer'}
            onPress={() => handleShutternautFilterSelection('nophotographer')}
            selected={eventShutternautFilter === 'nophotographer'}
          />
          <SelectableMenuItem
            title={'Has Photographer'}
            onPress={() => handleShutternautFilterSelection('hasphotographer')}
            selected={eventShutternautFilter === 'hasphotographer'}
          />
          <SelectableMenuItem
            title={'Needs Photographer'}
            onPress={() => handleShutternautFilterSelection('needsPhotographer')}
            selected={eventShutternautFilter === 'needsPhotographer'}
          />
        </>
      )}
    </AppMenu>
  );
};
