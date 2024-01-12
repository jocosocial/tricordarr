import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../../Switches/SettingSwitch';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {DataTable, Divider, Text} from 'react-native-paper';
import {SocketControlView} from '../../../Views/SocketControlView';
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag';
import {SocketHealthcheckData} from '../../../../libraries/Structs/SocketStructs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../../libraries/Storage';
import {RefreshControl} from 'react-native';
import {commonStyles} from '../../../../styles';
import {useSocket} from '../../../Context/Contexts/SocketContext';
import {WebSocketState} from '../../../../libraries/Network/Websockets';
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
