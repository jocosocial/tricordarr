import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../Switches/SettingSwitch';
import {useConfig} from '../../Context/Contexts/ConfigContext';

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
          <SettingSwitch
            title={'Enable Notification Socket'}
            value={appConfig.enableNotificationSocket}
            onPress={toggleNotificationSocket}
          />
          <SettingSwitch title={'Enable Fez Socket'} value={appConfig.enableFezSocket} onPress={toggleFezSocket} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
