import * as React from 'react';
import {FAB, Portal} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {FabGroupAction} from './FABGroupAction';
import {AppIcons} from '../../../libraries/Enums/Icons';

export const SeamailNewFAB = () => {
  const [state, setState] = React.useState({open: false});
  const theme = useAppTheme();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={true}
        icon={open ? AppIcons.chat : AppIcons.new}
        color={theme.colors.onPrimary}
        fabStyle={{
          backgroundColor: theme.colors.primary,
        }}
        label={open ? 'Create new' : undefined}
        // This might need to be moved out due to the rendered-too-many-hooks thing.
        actions={[
          FabGroupAction({icon: AppIcons.seamailCreate, label: 'Seamail', onPress: () => console.log('new seamail')}),
          FabGroupAction({
            icon: AppIcons.krakentalkCreate,
            label: 'KrakenTalk',
            onPress: () => console.log('krakentalk'),
          }),
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
