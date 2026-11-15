import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {HelperText, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {BatteryOptimizationSettingsView} from '#src/Components/Views/Settings/BatteryOptimizationSettingsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';
import {getCurrentBackgroundStatus} from '#src/Libraries/Notifications/Push/BackgroundStatus';
import {PerAccountStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('BackgroundConnectionSettingsAndroidView.tsx');

export const BackgroundConnectionSettingsAndroidView = () => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {enableUserNotifications} = useEnableUserNotification();
  const {appConfig, updateAppConfig} = useConfig();
  const [status, setStatus] = useState<PerAccountStatus | undefined>();
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);

  /**
   * Pull the background socket status from native, which is the source of truth.
   */
  const fetchStatus = useCallback(async () => {
    setStatus(await getCurrentBackgroundStatus());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus()
      .catch(error => logger.error('Failed to fetch background status', error))
      .finally(() => setRefreshing(false));
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus().catch(error => logger.error('Failed to fetch background status', error));
    const subscription = NativeTricordarrModule.onBackgroundStatusChanged(() => {
      fetchStatus().catch(error => logger.error('Failed to fetch background status', error));
    });
    return () => subscription.remove();
  }, [fetchStatus]);

  // useBackHandler(() => {
  //   navigation.replace(SettingsStackScreenComponents.settings);
  //   return true;
  // });

  const handleEnable = () => {
    const newValue = !appConfig.enableBackgroundWorker;
    updateAppConfig({
      ...appConfig,
      enableBackgroundWorker: newValue,
    });
    setEnable(newValue);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottomSmall}>
            The background worker (which Android calls a Foreground Service) is necessary to enable push notifications
            in an off-grid environment. It runs on its own, so notifications keep arriving after the app is closed.
          </Text>
          <Text>
            Android Law™ currently requires the app to display a notification that this worker has started. You can
            safely dismiss the notification and the worker will continue to run.
          </Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Settings</ListSubheader>
        </ListSection>
        <PaddedContentView padSides={false} padBottom={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'enableBackgroundWorker'}
                testID={'enableBackgroundWorker-switch'}
                label={'Enable Background Worker'}
                onPress={handleEnable}
                style={commonStyles.paddingHorizontalSmall}
                helperText={'Use this to disable the worker if it is causing problems.'}
                value={enable}
              />
            </View>
          </Formik>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Status</ListSubheader>
          <DataFieldListItem
            title={'Previous Start'}
            description={<RelativeTimeTag date={status?.startedAt ? new Date(status.startedAt) : undefined} />}
          />
          <DataFieldListItem title={'Socket State'} description={status?.state ?? 'Unknown'} />
          <DataFieldListItem
            title={'Last Healthcheck'}
            description={
              status?.lastHealthcheckAt ? (
                <RelativeTimeTag date={new Date(status.lastHealthcheckAt)} />
              ) : (
                <Text>Unknown</Text>
              )
            }
          />
          {status?.lastHealthcheckAt && (
            <DataFieldListItem
              title={'Last Healthcheck Result'}
              description={status.lastHealthcheckSuccess ? 'Success' : 'Failure'}
            />
          )}
          <DataFieldListItem title={'Failed Count'} description={String(status?.failedCount ?? 0)} />
          {status?.lastError && <DataFieldListItem title={'Last Error'} description={status.lastError} />}
        </ListSection>
        <PaddedContentView padBottom={false} />
        <PaddedContentView padSides={false}>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            You can pull to refresh this page if you believe the WebSocket state is out of date.
          </HelperText>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Control</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Enabled'} description={String(enableUserNotifications)} />
        <PaddedContentView>
          <PrimaryActionButton
            testID={'start-button'}
            buttonText={'Start'}
            buttonColor={theme.colors.twitarrPositiveButton}
            onPress={() => startPushProvider().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
          <PrimaryActionButton
            testID={'stop-button'}
            buttonText={'Stop'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => stopPushProvider().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            Note: It may take a few seconds for the worker notification to appear on start.
          </HelperText>
        </PaddedContentView>
        <BatteryOptimizationSettingsView />
      </ScrollingContentView>
    </AppView>
  );
};
