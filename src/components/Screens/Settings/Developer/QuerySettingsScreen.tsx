import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable, Divider, Text} from 'react-native-paper';
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
import humanizeDuration from 'humanize-duration';
import {defaultCacheTime, defaultStaleTime} from '../../../../libraries/Network/APIClient';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext';

export const QuerySettingsScreen = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();
  const [cacheTime, setCacheTime] = useState(queryClient.getDefaultOptions().queries?.cacheTime);
  const [staleTime, setStaleTime] = useState(queryClient.getDefaultOptions().queries?.staleTime);
  const {errorCount, setErrorCount} = useSwiftarrQueryClient();

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
      },
    });
    queryClient.getQueryCache().clear();
  };

  const toggleCacheTime = () => {
    if (cacheTime) {
      // disable
      updateAppConfig({
        ...appConfig,
        apiClientConfig: {
          ...appConfig.apiClientConfig,
          cacheTime: 0,
        },
      });
      queryClient.getQueryCache().clear();
      setCacheTime(0);
    } else {
      // enable
      updateAppConfig({
        ...appConfig,
        apiClientConfig: {
          ...appConfig.apiClientConfig,
          cacheTime: defaultCacheTime,
        },
      });
      setCacheTime(defaultCacheTime);
    }
  };

  const toggleStaleTime = () => {
    if (staleTime) {
      // disable
      updateAppConfig({
        ...appConfig,
        apiClientConfig: {
          ...appConfig.apiClientConfig,
          staleTime: 0,
        },
      });
      setStaleTime(0);
    } else {
      // enable
      updateAppConfig({
        ...appConfig,
        apiClientConfig: {
          ...appConfig.apiClientConfig,
          staleTime: defaultStaleTime,
        },
      });
      setStaleTime(defaultStaleTime);
    }
  };

  const triggerDisruption = () => {
    setErrorCount(1);
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
              <DataTable.Cell>Last Cache Bust</DataTable.Cell>
              <DataTable.Cell>
                <RelativeTimeTag date={new Date(appConfig.apiClientConfig.cacheBuster)} />
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Default Cache Time</DataTable.Cell>
              <DataTable.Cell>{cacheTime !== undefined && humanizeDuration(cacheTime)}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Default Stale Time</DataTable.Cell>
              <DataTable.Cell>{staleTime !== undefined && humanizeDuration(staleTime)}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Error Count</DataTable.Cell>
              <DataTable.Cell>{errorCount}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Bust Cache'}
            onPress={bustCache}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Toggle Cache Enable'}
            onPress={toggleCacheTime}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Toggle Stale Enable'}
            onPress={toggleStaleTime}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Trigger Disruption'}
            onPress={triggerDisruption}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
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
