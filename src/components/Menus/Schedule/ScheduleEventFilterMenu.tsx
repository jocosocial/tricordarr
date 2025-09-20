import React, {useState} from 'react';
import {Divider} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {EventType} from '#src/Libraries/Enums/EventType.ts';
import {useFilter} from '#src/Components/Context/Contexts/FilterContext.ts';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';
import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';

export const ScheduleEventFilterMenu = () => {
  const [visible, setVisible] = useState(false);
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

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </AppHeaderMenu>
  );
};
