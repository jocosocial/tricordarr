import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable, Divider, Text} from 'react-native-paper';
import {RefreshControl, View} from 'react-native';
import React from 'react';
import {AppView} from '../../../Views/AppView';
import {useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag';
import humanizeDuration from 'humanize-duration';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext';
import {QuerySettingsForm} from '../../../Forms/Settings/QuerySettingsForm.tsx';
import {QuerySettingsFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {commonStyles} from '../../../../styles';
import {useHealthQuery} from '../../../Queries/Client/ClientQueries';

export const QuerySettingsScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();
  const {errorCount, setErrorCount} = useSwiftarrQueryClient();
  const {refetch: refetchHealth, isFetching: isFetchingHealth} = useHealthQuery({
    enabled: false,
  });

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
    setErrorCount(appConfig.apiClientConfig.disruptionThreshold + 1);
  };

  const initialValues: QuerySettingsFormValues = {
    defaultPageSize: appConfig.apiClientConfig.defaultPageSize,
    cacheTimeDays: appConfig.apiClientConfig.cacheTime / 24 / 60 / 60 / 1000,
    retry: appConfig.apiClientConfig.retry,
    staleTimeMinutes: appConfig.apiClientConfig.staleTime / 60 / 1000,
    disruptionThreshold: appConfig.apiClientConfig.disruptionThreshold,
  };

  const onSubmit = (values: QuerySettingsFormValues, helpers: FormikHelpers<QuerySettingsFormValues>) => {
    if (values.defaultPageSize !== appConfig.apiClientConfig.defaultPageSize) {
      queryClient.getQueryCache().clear();
    }
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
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetchingHealth} enabled={false} />}>
        <PaddedContentView padTop={true}>
          <QuerySettingsForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text>Cache Management</Text>
          <DataTable style={commonStyles.marginBottomSmall}>
            <SettingDataTableRow title={'Last Bust'}>
              <RelativeTimeTag date={new Date(appConfig.apiClientConfig.cacheBuster)} />
            </SettingDataTableRow>
            <SettingDataTableRow title={'Item Count'} value={queryClient.getQueryCache().getAll().length.toString()} />
          </DataTable>
          <PrimaryActionButton
            buttonText={'Bust Cache'}
            onPress={bustCache}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text>Connection Disruption</Text>
          <DataTable style={commonStyles.marginBottomSmall}>
            <SettingDataTableRow title={'Error Count'} value={errorCount.toString()} />
          </DataTable>
          <PrimaryActionButton
            buttonText={'Trigger Disruption'}
            onPress={triggerDisruption}
            buttonColor={theme.colors.twitarrNegativeButton}
            style={commonStyles.marginBottom}
          />
          <PrimaryActionButton
            buttonText={'Server Health Check'}
            onPress={refetchHealth}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <Divider bold={true} />

        {/*</PaddedContentView>*/}
        {/*<Divider bold={true} />*/}
        {/*<PaddedContentView padTop={true}>*/}

        {/*</PaddedContentView>*/}
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
