import * as React from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useState} from 'react';

export const ScheduleFAB = () => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  const color = theme.colors.onPrimary;
  const backgroundColor = theme.colors.primary;

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
          }),
          FabGroupAction({
            icon: AppIcons.lfgFind,
            label: 'Find',
            onPress: () => console.log('Find LFG'),
          }),
          FabGroupAction({
            icon: AppIcons.lfgJoined,
            label: 'Joined',
            onPress: () => console.log('Joined LFG'),
          }),
          FabGroupAction({
            icon: AppIcons.lfgOwned,
            label: 'Owned',
            onPress: () => console.log('Your LFG'),
          }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
