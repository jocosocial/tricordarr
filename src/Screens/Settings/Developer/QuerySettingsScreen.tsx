import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {DataTable} from 'react-native-paper';
import {RefreshControl} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useAppTheme} from '#src/Styles/Theme';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {QuerySettingsForm} from '#src/Components/Forms/Settings/QuerySettingsForm';
import {QuerySettingsFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';
import {SettingDataTableRow} from '#src/Components/DataTables/SettingDataTableRow';
import {commonStyles} from '#src/Styles';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {CacheManager} from '@georstat/react-native-image-cache';
import {getDirSize} from '#src/Libraries/Storage/ImageStorage';
import {filesize} from 'filesize';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/SettingsStackNavigator';

export type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.querySettingsScreen>;

const generateNewCacheBuster = () => new Date().toString();

export const QuerySettingsScreen = ({navigation}: Props) => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const {appConfig, updateAppConfig} = useConfig();
  const {errorCount, setErrorCount} = useSwiftarrQueryClient();
  const {refetch: refetchHealth, isFetching: isFetchingHealth} = useHealthQuery({
    enabled: false,
  });
  const [imageCacheSize, setImageCacheSize] = useState(0);
  const [oldestCacheItem, setOldestCacheItem] = useState<Date>();

  const bustQueryCache = () => {
    console.log('[QuerySettingsScreen.tsx] Busting query cache.');
    updateAppConfig({
      ...appConfig,
      apiClientConfig: {
        ...appConfig.apiClientConfig,
        cacheBuster: generateNewCacheBuster(),
      },
    });
    queryClient.getQueryCache().clear();
    refreshCacheStats();
  };

  const bustImageCache = async () => {
    console.log('[QuerySettingsScreen.tsx] Busting image cache.');
    await CacheManager.clearCache();
    await refreshImageCacheSize();
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
    imageStaleTimeDays: appConfig.apiClientConfig.imageStaleTime / 24 / 60 / 60 / 1000,
  };

  const onSubmit = (values: QuerySettingsFormValues, helpers: FormikHelpers<QuerySettingsFormValues>) => {
    const bustCache = values.defaultPageSize !== appConfig.apiClientConfig.defaultPageSize;
    updateAppConfig({
      ...appConfig,
      apiClientConfig: {
        ...appConfig.apiClientConfig,
        defaultPageSize: values.defaultPageSize,
        cacheTime: values.cacheTimeDays * 24 * 60 * 60 * 1000,
        retry: values.retry,
        staleTime: values.staleTimeMinutes * 60 * 1000,
        disruptionThreshold: values.disruptionThreshold,
        imageStaleTime: values.imageStaleTimeDays * 24 * 60 * 60 * 1000,
        cacheBuster: bustCache ? generateNewCacheBuster() : appConfig.apiClientConfig.cacheBuster,
      },
    });
    if (bustCache) {
      queryClient.getQueryCache().clear();
      // This needs a moment to let any queries refresh.
      setTimeout(() => {
        refreshCacheStats();
      }, 1000);
    }
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: values,
    });
  };

  const refreshImageCacheSize = useCallback(async () => {
    // https://github.com/georstat/react-native-image-cache/issues/81
    const cacheSize = await getDirSize(CacheManager.config.baseDir);
    setImageCacheSize(cacheSize);
  }, []);

  useEffect(() => {
    refreshImageCacheSize();
  }, [refreshImageCacheSize]);

  const refreshCacheStats = useCallback(() => {
    const contents = queryClient.getQueryCache().getAll();
    console.log('[QuerySettingsScreen.tsx] refreshing stats, had count', contents.length);
    const cachedDates = contents
      .map(c => {
        return c.state.dataUpdatedAt;
      })
      .filter(v => v !== 0);
    if (cachedDates.length > 0) {
      const lowest = Math.min(...cachedDates);
      setOldestCacheItem(new Date(lowest));
    }
  }, [queryClient]);

  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

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
              <SettingDataTableRow reverseSplit={true} title={'Oldest Item'}>
                <RelativeTimeTag date={oldestCacheItem} />
              </SettingDataTableRow>
            </DataTable>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonText={'Cached Keys'}
              onPress={() => navigation.push(SettingsStackScreenComponents.queryKeysSettingsScreen)}
              buttonColor={theme.colors.twitarrNeutralButton}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonText={'Bust Query Cache'}
              onPress={bustQueryCache}
              buttonColor={theme.colors.twitarrNegativeButton}
            />
          </PaddedContentView>
          <PaddedContentView>
            <DataTable>
              <SettingDataTableRow reverseSplit={true} title={'Image Cache Size'} value={filesize(imageCacheSize)} />
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
