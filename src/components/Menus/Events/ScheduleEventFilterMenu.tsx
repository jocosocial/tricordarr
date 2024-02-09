import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {EventType} from '../../../libraries/Enums/EventType';
import {useAppTheme} from '../../../styles/Theme';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ScheduleEventFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();
  const {eventTypeFilter, setEventTypeFilter, eventFavoriteFilter, setEventFavoriteFilter} = useFilter();
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // This also shows joined LFGs, hopefully that's not too surprising
  const handleFavoriteSelection = () => {
    setEventFavoriteFilter(!eventFavoriteFilter);
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
  };

  const anyActiveFilter = eventFavoriteFilter || eventTypeFilter;

  const menuAnchor = (
    <Item
      title={'Filter'}
      color={anyActiveFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Your Events'}
        onPress={handleFavoriteSelection}
        style={eventFavoriteFilter ? commonStyles.surfaceVariant : undefined}
        trailingIcon={eventFavoriteFilter ? AppIcons.check : undefined}
      />
      <Divider bold={true} />
      {Object.keys(EventType).map(eventType => {
        return (
          <Menu.Item
            key={eventType}
            style={eventTypeFilter === eventType ? commonStyles.surfaceVariant : undefined}
            title={EventType[eventType as keyof typeof EventType]}
            onPress={() => handleFilterSelection(eventType)}
            trailingIcon={eventTypeFilter === eventType ? AppIcons.check : undefined}
          />
        );
      })}
    </Menu>
  );
};
