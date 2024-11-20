import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {DataTable} from 'react-native-paper';
import {RefreshControl} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
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
import {getDirSize} from '../../../../libraries/Storage/ImageStorage.ts';
import {filesize} from 'filesize';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStackNavigator.tsx';
import {SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation.ts';

export type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.querySettingsScreen>;

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
        cacheBuster: new Date().toString(),
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
    imageStaleTimeHours: appConfig.apiClientConfig.imageStaleTime / 60 / 60 / 1000,
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
        imageStaleTime: values.imageStaleTimeHours * 60 * 60 * 1000,
      },
    });
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
