import * as React from 'react';
import {FAB, Portal, Provider} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {styleDefaults} from '../../../styles';

export const SeamailNewFAB = () => {
  const [state, setState] = React.useState({open: false});
  const theme = useAppTheme();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const {open} = state;

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          visible
          icon={open ? 'chat' : 'plus'}
          theme={theme}
          variant={'primary'}
          color={theme.colors.onPrimary}
          fabStyle={{
            backgroundColor: theme.colors.primary,
          }}
          actions={[
            {
              icon: 'email',
              label: 'New Seamail',
              color: theme.colors.onPrimary,
              style: {
                backgroundColor: theme.colors.primary,
              },
              labelStyle: {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurfaceVariant,
                paddingVertical: styleDefaults.marginSize / 4,
                paddingHorizontal: styleDefaults.marginSize / 2,
                borderRadius: theme.roundness,
              },
              onPress: () => console.log('New Seamail'),
            },
            {
              icon: 'phone-outgoing',
              label: 'KrakenTalk',
              color: theme.colors.onPrimary,
              style: {
                backgroundColor: theme.colors.primary,
              },
              labelStyle: {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurfaceVariant,
                paddingVertical: styleDefaults.marginSize / 4,
                paddingHorizontal: styleDefaults.marginSize / 2,
                borderRadius: theme.roundness,
              },
              onPress: () => console.log('Starting KrakenTalk'),
            },
          ]}
          onStateChange={onStateChange}
        />
      </Portal>
    </Provider>
  );
};
