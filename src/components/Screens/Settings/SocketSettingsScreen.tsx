import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../Switches/SettingSwitch';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {Divider, Text} from 'react-native-paper';
import {SocketControlView} from '../../Views/SocketControlView';

export const SocketSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();

  async function toggleNotificationSocket() {
    updateAppConfig({
      ...appConfig,
      enableNotificationSocket: !appConfig.enableNotificationSocket,
    });
  }

  async function toggleFezSocket() {
    updateAppConfig({
      ...appConfig,
      enableFezSocket: !appConfig.enableFezSocket,
    });
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'}>Enable</Text>
          <SettingSwitch
            title={'Notification Socket'}
            value={appConfig.enableNotificationSocket}
            onPress={toggleNotificationSocket}
            description={'Used for general purpose notifications across all app features.'}
          />
          <SettingSwitch
            title={'Fez Sockets'}
            value={appConfig.enableFezSocket}
            onPress={toggleFezSocket}
            description={
              'Opened when a fez is loaded. Provides membership change messages in addition to content updates.'
            }
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Control</Text>
          <SocketControlView title={'Notification Socket'} />
        </PaddedContentView>
        <Divider bold={true} />
      </ScrollingContentView>
    </AppView>
  );
};
