import React from 'react';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {SettingSwitch} from '../../../Switches/SettingSwitch';

export const ConfigDeveloperOptionsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();

  const handleSwitch = () =>
    updateAppConfig({
      ...appConfig,
      enableDeveloperOptions: !appConfig.enableDeveloperOptions,
    });

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            Enable developer options within this app. Additional options will be available in the Developers section of
            the Settings screen.
          </Text>
          <SettingSwitch title={'Developer Options'} onPress={handleSwitch} value={appConfig.enableDeveloperOptions} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
