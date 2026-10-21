import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider} from 'react-native-paper';

import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useScheduleFilter} from '#src/Context/Contexts/ScheduleFilterContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {EventType} from '#src/Enums/EventType';
import {ScheduleSource, ScheduleSourceKey} from '#src/Enums/ScheduleSource';
import {ShutternautFilter, ShutternautFilterKey} from '#src/Enums/ShutternautFilter';
import {useMenu} from '#src/Hooks/useMenu';

// Paper's Menu pads the top and bottom of its surface by this much (Menu.tsx shadowMenuContainer).
const MENU_VERTICAL_PADDING = 8;

/**
 * Filter menu for the schedule day screen. Split into two tiers (see #458):
 *  - Sources: which lists contribute items to the schedule. Multi-select, additive (OR).
 *  - Refinements: narrow a single source (event type/favorite/photographer narrow Official
 *    Events; unread narrows Private Events). Combined with AND, and selecting one implies its
 *    source so a refinement is never silently inert.
 */
export const ScheduleEventFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {
    eventSources,
    toggleEventSource,
    eventTypeFilter,
    setEventTypeFilter,
    eventFavoriteFilter,
    setEventFavoriteFilter,
    eventShutternautFilter,
    setEventShutternautFilter,
    eventPersonalUnreadFilter,
    setEventPersonalUnreadFilter,
    anyScheduleFilterActive,
    clearScheduleFilters,
  } = useScheduleFilter();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const {isLoggedIn} = useSession();
  const {preRegistrationMode} = usePreRegistration();
  const {hasShutternaut, hasShutternautManager} = useRoles();
  // LFGs and Private Events are unavailable during pre-registration regardless of login state -
  // see the matching query gates in ScheduleDayScreen.tsx.
  const disablePersonalSources = !isLoggedIn || preRegistrationMode;

  // The first header sits on surfaceVariant, but Paper pads the top of every menu with 8dp of the
  // plain menu surface, which shows as a seam above it. Zero that padding on the menu and
  // draw the same 8dp as a surfaceVariant strip (rounded to match the menu's corners) so the
  // corner zone blends into the header. The bottom padding is left alone: the last row isn't
  // a header, so it already matches.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {paddingTop: 0},
        topStrip: {
          ...commonStyles.surfaceVariant,
          height: MENU_VERTICAL_PADDING,
          borderTopLeftRadius: theme.roundness,
          borderTopRightRadius: theme.roundness,
        },
      }),
    [commonStyles.surfaceVariant, theme.roundness],
  );

  const handleSourceSelection = (source: ScheduleSourceKey) => {
    toggleEventSource(source);
    closeMenu();
  };

  const handleFavoriteSelection = () => {
    setEventFavoriteFilter(!eventFavoriteFilter);
    closeMenu();
  };

  const handlePersonalUnreadSelection = () => {
    setEventPersonalUnreadFilter(!eventPersonalUnreadFilter);
    closeMenu();
  };

  /**
   * This mirrors the implementation on the Site UI of doing the filtering in JS
   * rather than passing through to the API. Some day we may want to do that. Lets
   * see how it goes in 2026 first.
   */
  const handleShutternautFilterSelection = (filterValue: ShutternautFilterKey) => {
    setEventShutternautFilter(prev => (prev === filterValue ? undefined : filterValue));
    closeMenu();
  };

  const handleTypeFilterSelection = (newEventTypeFilter: string) => {
    setEventTypeFilter(prev => (prev === newEventTypeFilter ? '' : newEventTypeFilter));
    closeMenu();
  };

  const menuAnchor = (
    <FilterMenuAnchor active={anyScheduleFilterActive} onPress={openMenu} onLongPress={clearScheduleFilters} />
  );

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor} contentStyle={styles.content}>
      <View style={styles.topStrip} />
      <ListSubheader>Sources</ListSubheader>
      <SelectableMenuItem
        title={ScheduleSource.officialEvents}
        onPress={() => handleSourceSelection('officialEvents')}
        selected={eventSources.includes('officialEvents')}
      />
      <SelectableMenuItem
        title={ScheduleSource.privateEvents}
        onPress={() => handleSourceSelection('privateEvents')}
        selected={eventSources.includes('privateEvents')}
        disabled={disablePersonalSources}
      />
      <SelectableMenuItem
        title={ScheduleSource.lfgJoined}
        onPress={() => handleSourceSelection('lfgJoined')}
        selected={eventSources.includes('lfgJoined')}
        disabled={disablePersonalSources}
      />
      <SelectableMenuItem
        title={ScheduleSource.lfgOwned}
        onPress={() => handleSourceSelection('lfgOwned')}
        selected={eventSources.includes('lfgOwned')}
        disabled={disablePersonalSources}
      />
      <SelectableMenuItem
        title={ScheduleSource.lfgOpen}
        onPress={() => handleSourceSelection('lfgOpen')}
        selected={eventSources.includes('lfgOpen')}
        disabled={disablePersonalSources || !appConfig.schedule.eventsShowOpenLfgs}
      />
      <Divider bold={true} />
      <ListSubheader>Events</ListSubheader>
      <SelectableMenuItem
        title={'Favorites'}
        onPress={handleFavoriteSelection}
        selected={eventFavoriteFilter}
        disabled={!isLoggedIn}
      />
      {Object.keys(EventType).map(eventType => {
        return (
          <SelectableMenuItem
            key={eventType}
            title={EventType[eventType as keyof typeof EventType]}
            onPress={() => handleTypeFilterSelection(eventType)}
            selected={eventTypeFilter === eventType}
          />
        );
      })}
      {(hasShutternaut || hasShutternautManager) && (
        <>
          <Divider />
          {Object.keys(ShutternautFilter).map(filterKey => {
            const key = filterKey as ShutternautFilterKey;
            return (
              <SelectableMenuItem
                key={key}
                title={ShutternautFilter[key]}
                onPress={() => handleShutternautFilterSelection(key)}
                selected={eventShutternautFilter === key}
              />
            );
          })}
        </>
      )}
      <Divider bold={true} />
      <ListSubheader>Private Events</ListSubheader>
      <SelectableMenuItem
        title={'Unread'}
        onPress={handlePersonalUnreadSelection}
        selected={eventPersonalUnreadFilter}
        disabled={disablePersonalSources}
      />
    </AppMenu>
  );
};
