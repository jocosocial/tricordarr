import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {DataTable, Text} from 'react-native-paper';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';

export const OobeSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();

  async function resetOobeVersion() {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: 0,
    });
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'}>Out-of-Box Experience</Text>
          <DataTable>
            <SettingDataTableRow title={'Expected'} value={String(appConfig.oobeExpectedVersion)} />
            <SettingDataTableRow title={'Completed'} value={String(appConfig.oobeCompletedVersion)} />
          </DataTable>
          <PrimaryActionButton buttonText={'Reset'} onPress={resetOobeVersion} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
