import * as React from 'react';
import {useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useEventStackNavigation, useEventStackRoute} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';

export const EventFAB = () => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();
  const navigation = useEventStackNavigation();
  const route = useEventStackRoute();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  const color = theme.colors.inverseOnSurface;
  const backgroundColor = theme.colors.inverseSurface;

  const handleNavigation = (component: EventStackComponents) => {
    if (route.name === component) {
      return;
    }
    navigation.push(component);
  };

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={true}
        icon={AppIcons.events}
        color={color}
        fabStyle={{
          backgroundColor: backgroundColor,
        }}
        label={open ? 'Events' : undefined}
        actions={[
          FabGroupAction({
            icon: AppIcons.favorite,
            label: 'Favorites',
            onPress: () => handleNavigation(EventStackComponents.eventFavoritesScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.search,
            label: 'Search',
            onPress: () => handleNavigation(EventStackComponents.eventSearchScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.settings,
            label: 'Settings',
            onPress: () => handleNavigation(EventStackComponents.eventSettingsScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.help,
            label: 'Help',
            onPress: () => handleNavigation(EventStackComponents.eventHelpScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
