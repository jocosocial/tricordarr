import FastImage from '@d11/react-native-fast-image';
import {CacheManager} from '@georstat/react-native-image-cache';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {QuerySettingsForm} from '#src/Components/Forms/Settings/QuerySettingsForm';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {getDirSize} from '#src/Libraries/Storage/ImageStorage';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {commonStyles} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';
import {QuerySettingsFormValues} from '#src/Types/FormValues';

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
    await FastImage.clearDiskCache();
    await FastImage.clearMemoryCache();
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
        <ListSubheader>Query Cache</ListSubheader>
        <ListItem
          title={'Last Query Bust'}
          description={<RelativeTimeTag date={new Date(appConfig.apiClientConfig.cacheBuster)} />}
        />
        <ListItem title={'Query Item Count'} description={queryClient.getQueryCache().getAll().length.toString()} />
        <ListItem title={'Oldest Item'} description={<RelativeTimeTag date={oldestCacheItem} />} />
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Query Keys'}
            onPress={() => navigation.push(SettingsStackScreenComponents.queryKeysSettingsScreen)}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Connection Disruption</ListSubheader>
          <ListItem title={'Error Count'} description={errorCount.toString()} />
          <PaddedContentView padTop={true}>
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
