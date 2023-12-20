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
import {QuerySettingsForm} from '../../../Forms/QuerySettingsForm';
import {QuerySettingsFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';

export const QuerySettingsScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();
  const {errorCount, setErrorCount} = useSwiftarrQueryClient();

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

  const triggerDisruption = () => {
    setErrorCount(1);
  };

  const initialValues: QuerySettingsFormValues = {
    defaultPageSize: appConfig.apiClientConfig.defaultPageSize,
    cacheTimeDays: appConfig.apiClientConfig.cacheTime / 24 / 60 / 60 / 1000,
    retry: appConfig.apiClientConfig.retry,
    staleTimeMinutes: appConfig.apiClientConfig.staleTime / 60 / 1000,
    disruptionThreshold: appConfig.apiClientConfig.disruptionThreshold,
  };

  const onSubmit = (values: QuerySettingsFormValues, helpers: FormikHelpers<QuerySettingsFormValues>) => {
    updateAppConfig({
      ...appConfig,
      apiClientConfig: {
        ...appConfig.apiClientConfig,
        defaultPageSize: values.defaultPageSize,
        cacheTime: values.cacheTimeDays * 24 * 60 * 60 * 1000,
        retry: values.retry,
        staleTime: values.staleTimeMinutes * 60 * 1000,
        disruptionThreshold: values.disruptionThreshold,
      },
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: values,
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <QuerySettingsForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
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
              <DataTable.Cell>{humanizeDuration(appConfig.apiClientConfig.cacheTime)}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Default Stale Time</DataTable.Cell>
              <DataTable.Cell>{humanizeDuration(appConfig.apiClientConfig.staleTime)}</DataTable.Cell>
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
