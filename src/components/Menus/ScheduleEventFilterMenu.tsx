import React, {Dispatch, SetStateAction, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {EventType} from '../../libraries/Enums/EventType';
import {useAppTheme} from '../../styles/Theme';

interface ScheduleEventFilterMenuProps {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
}

export const ScheduleEventFilterMenu = ({eventTypeFilter, setEventTypeFilter}: ScheduleEventFilterMenuProps) => {
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleFilterSelection = (newEventTypeFilter: string) => {
    if (newEventTypeFilter === eventTypeFilter) {
      setEventTypeFilter('');
    } else {
      setEventTypeFilter(newEventTypeFilter);
    }
    closeMenu();
  };

  const menuAnchor = (
    <Item
      title={'Filter'}
      color={eventTypeFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.filter}
      onPress={openMenu}
    />
  );

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {Object.keys(EventType).map(eventType => {
        const itemStyle = eventTypeFilter === eventType ? {backgroundColor: theme.colors.surfaceVariant} : undefined;
        return (
          <Menu.Item
            key={eventType}
            style={itemStyle}
            title={EventType[eventType as keyof typeof EventType]}
            onPress={() => handleFilterSelection(eventType)}
          />
        );
      })}
    </Menu>
  );
};
