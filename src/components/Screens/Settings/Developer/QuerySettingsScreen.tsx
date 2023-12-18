import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable, Text} from 'react-native-paper';
import {View} from 'react-native';
import React, {useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {onlineManager, useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {timeAgo} from '../../../../libraries/DateTime';
import {RelativeTimeTag} from '../../../Text/RelativeTimeTag';

export const QuerySettingsScreen = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();

  const handleOnline = (value: boolean) => {
    onlineManager.setOnline(value);
    setIsOnline(value);
  };

  const bustCache = () => {
    console.log('[QuerySettingsScreen.tsx] Busting query cache.');
    updateAppConfig({
      ...appConfig,
      apiClientConfig: {
        ...appConfig.apiClientConfig,
        cacheBuster: new Date().toString(),
      }
    });
    queryClient.getQueryCache().clear();
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Query Client</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Online</DataTable.Cell>
              <DataTable.Cell>{String(isOnline)}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Last Cache Bust</DataTable.Cell>
              <DataTable.Cell><RelativeTimeTag date={new Date(appConfig.apiClientConfig.cacheBuster)} /></DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton buttonText={'Bust Cache'} onPress={bustCache} buttonColor={theme.colors.twitarrNegativeButton} />
        </PaddedContentView>
        {/*<PaddedContentView padTop={true}>*/}
        {/*  <PrimaryActionButton*/}
        {/*    buttonText={'Online'}*/}
        {/*    onPress={() => handleOnline(true)}*/}
        {/*    buttonColor={theme.colors.twitarrPositiveButton}*/}
        {/*  />*/}
        {/*</PaddedContentView>*/}
        {/*<PaddedContentView>*/}
        {/*  <PrimaryActionButton*/}
        {/*    buttonText={'Offline'}*/}
        {/*    onPress={() => handleOnline(false)}*/}
        {/*    buttonColor={theme.colors.twitarrNegativeButton}*/}
        {/*  />*/}
        {/*</PaddedContentView>*/}
      </ScrollingContentView>
    </AppView>
  );
};
