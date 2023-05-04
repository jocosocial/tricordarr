import * as React from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStack';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useState} from 'react';
import {AndroidColor} from '@notifee/react-native';

export const SeamailNewFAB = () => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();
  const navigation = useSeamailStack();
  const {asPrivilegedUser, asModerator, asTwitarrTeam} = usePrivilege();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  const color = asPrivilegedUser ? AndroidColor.WHITE : theme.colors.onPrimary;
  const backgroundColor = asPrivilegedUser ? theme.colors.twitarrNegativeButton : theme.colors.primary;

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={true}
        icon={open ? AppIcons.chat : AppIcons.new}
        color={color}
        fabStyle={{
          backgroundColor: backgroundColor,
        }}
        label={open ? 'Create new' : undefined}
        // This might need to be moved out due to the rendered-too-many-hooks thing.
        actions={[
          FabGroupAction({
            icon: AppIcons.seamailCreate,
            label: 'Seamail',
            onPress: () =>
              navigation.push(SeamailStackScreenComponents.seamailCreateScreen, {
                initialAsModerator: asModerator,
                initialAsTwitarrTeam: asTwitarrTeam,
              }),
          }),
          FabGroupAction({
            icon: AppIcons.krakentalkCreate,
            label: 'KrakenTalk',
            onPress: () => navigation.push(SeamailStackScreenComponents.krakentalkCreateScreen),
          }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
