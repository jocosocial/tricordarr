import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable, Divider, Text} from 'react-native-paper';
import {RefreshControl, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext';
import {QuerySettingsForm} from '../../../Forms/Settings/QuerySettingsForm.tsx';
import {QuerySettingsFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {commonStyles} from '../../../../styles';
import {useHealthQuery} from '../../../Queries/Client/ClientQueries';
import {ListSection} from '../../../Lists/ListSection.tsx';
import {ListSubheader} from '../../../Lists/ListSubheader.tsx';
import {CacheManager} from '@georstat/react-native-image-cache';

export const QuerySettingsScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();
  const {errorCount, setErrorCount} = useSwiftarrQueryClient();
  const {refetch: refetchHealth, isFetching: isFetchingHealth} = useHealthQuery({
    enabled: false,
  });
  const [imageCacheSize, setImageCacheSize] = useState<number | undefined>();

  const bustQueryCache = () => {
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

  const bustImageCache = async () => {
    await CacheManager.clearCache();
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

  useEffect(() => {
    // https://github.com/georstat/react-native-image-cache/issues/81
    // This doesn't work.
    const getCacheSize = async () => {
      const cacheSize = await CacheManager.getCacheSize();
      setImageCacheSize(cacheSize);
    };
    getCacheSize();
  }, []);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetchingHealth} enabled={false} />}>
        <ListSection>
          <ListSubheader>General</ListSubheader>
          <PaddedContentView padTop={true}>
            <QuerySettingsForm initialValues={initialValues} onSubmit={onSubmit} />
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Cache Management</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable style={commonStyles.marginBottomSmall}>
              <SettingDataTableRow title={'Last Query Bust'} reverseSplit={true}>
                <RelativeTimeTag date={new Date(appConfig.apiClientConfig.cacheBuster)} />
              </SettingDataTableRow>
              <SettingDataTableRow
                reverseSplit={true}
                title={'Query Item Count'}
                value={queryClient.getQueryCache().getAll().length.toString()}
              />
            </DataTable>
            <PrimaryActionButton
              buttonText={'Bust Query Cache'}
              onPress={bustQueryCache}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
          <PaddedContentView>
            <DataTable>
              {imageCacheSize && (
                <SettingDataTableRow reverseSplit={true} title={'Image Cache Size'} value={imageCacheSize.toString()} />
              )}
            </DataTable>
            <PrimaryActionButton
              buttonText={'Bust Image Cache'}
              onPress={bustImageCache}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Connection Disruption</ListSubheader>
          <PaddedContentView padTop={true}>
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
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
