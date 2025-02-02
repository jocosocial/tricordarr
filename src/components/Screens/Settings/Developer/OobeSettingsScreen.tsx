import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {DataTable, Text} from 'react-native-paper';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {ListSubheader} from '../../../Lists/ListSubheader.tsx';
import {RootStackComponents, useRootStack} from '../../../Navigation/Stacks/RootStackNavigator.tsx';
import {useAppTheme} from '../../../../styles/Theme.ts';

export const OobeSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const navigation = useRootStack();
  const theme = useAppTheme();

  async function resetOobeVersion() {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: 0,
    });
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSubheader>Config</ListSubheader>
        <PaddedContentView>
          <DataTable>
            <SettingDataTableRow title={'Expected'} value={String(appConfig.oobeExpectedVersion)} />
            <SettingDataTableRow title={'Completed'} value={String(appConfig.oobeCompletedVersion)} />
          </DataTable>
          <PrimaryActionButton buttonText={'Reset'} onPress={resetOobeVersion} />
        </PaddedContentView>
        <ListSubheader>Debugging</ListSubheader>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Enter OOBE'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(RootStackComponents.oobeNavigator)}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
