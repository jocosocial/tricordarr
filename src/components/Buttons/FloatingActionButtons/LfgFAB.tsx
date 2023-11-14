import * as React from 'react';
import {useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useLFGStackNavigation, useLFGStackRoute} from '../../Navigation/Stacks/LFGStackNavigator';

export const LfgFAB = () => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  const color = theme.colors.inverseOnSurface;
  const backgroundColor = theme.colors.inverseSurface;

  const handleNavigation = (component: LfgStackComponents) => {
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
            onPress: () => handleNavigation(LfgStackComponents.lfgFindScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.lfgJoined,
            label: 'Joined',
            onPress: () => handleNavigation(LfgStackComponents.lfgJoinedScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          FabGroupAction({
            icon: AppIcons.lfgOwned,
            label: 'Owned',
            onPress: () => handleNavigation(LfgStackComponents.lfgOwnedScreen),
            backgroundColor: backgroundColor,
            color: color,
          }),
          // FabGroupAction({
          //   icon: AppIcons.help,
          //   label: 'Help',
          //   onPress: () => handleNavigation(LfgStackComponents.lfgHelpScreen),
          //   backgroundColor: backgroundColor,
          //   color: color,
          // }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
