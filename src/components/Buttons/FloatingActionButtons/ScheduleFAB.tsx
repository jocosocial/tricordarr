import * as React from 'react';
import {useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useScheduleStack, useScheduleStackRoute} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../../libraries/Enums/Navigation';

export const ScheduleFAB = () => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();
  const navigation = useScheduleStack();
  const route = useScheduleStackRoute();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  const color = theme.colors.inverseOnSurface;
  const backgroundColor = theme.colors.inverseSurface;

  const handleNavigation = (component: ScheduleStackComponents) => {
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
        icon={AppIcons.lfg}
        color={color}
        fabStyle={{
          backgroundColor: backgroundColor,
        }}
        label={open ? 'Looking For Group' : undefined}
        actions={[
          FabGroupAction({
            icon: AppIcons.new,
            label: 'New LFG',
            onPress: () => console.log('Create LFG'),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.lfgFind,
            label: 'Find',
            onPress: () => console.log('Find LFG'),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.lfgJoined,
            label: 'Joined',
            onPress: () => handleNavigation(ScheduleStackComponents.lfgJoinedScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.lfgOwned,
            label: 'Owned',
            onPress: () => handleNavigation(ScheduleStackComponents.lfgOwnedScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.help,
            label: 'Help',
            onPress: () => handleNavigation(ScheduleStackComponents.lfgHelpScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
