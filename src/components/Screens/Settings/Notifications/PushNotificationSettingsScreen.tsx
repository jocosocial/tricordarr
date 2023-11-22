import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../../Switches/SettingSwitch';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {PushNotificationConfig} from '../../../../libraries/AppConfig';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {DataTable, Divider, Text} from 'react-native-paper';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {check as checkPermission, PERMISSIONS, request as requestPermission, RESULTS} from 'react-native-permissions';
import {commonStyles} from '../../../../styles';

interface NotificationCategory {
  configKey: keyof PushNotificationConfig;
  title: string;
  disabled?: boolean;
}

export const PushNotificationSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const theme = useAppTheme();
  const [permissionStatus, setPermissionStatus] = useState('Unknown');

  const pushNotificationCategories: NotificationCategory[] = [
    {configKey: 'announcement', title: 'Announcements'},
    {configKey: 'seamailUnreadMsg', title: 'Seamails'},
    {configKey: 'fezUnreadMsg', title: 'LFG Posts'},
    {configKey: 'alertwordPost', title: 'Forum Alert Words'},
    {configKey: 'forumMention', title: 'Forum Mentions'},
    {configKey: 'followedEventStarting', title: 'Event Reminders', disabled: true},
  ];

  const toggleValue = (configKey: keyof PushNotificationConfig) => {
    let pushConfig = appConfig.pushNotifications;
    // https://bobbyhadz.com/blog/typescript-cannot-assign-to-because-it-is-read-only-property
    (pushConfig[configKey] as boolean) = !appConfig.pushNotifications[configKey];
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const setAllValue = (value: boolean) => {
    let pushConfig = appConfig.pushNotifications;
    pushNotificationCategories.flatMap(c => {
      if (!c.disabled) {
        (pushConfig[c.configKey] as boolean) = value;
      }
    });
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const handleEnable = () => {
    console.log('Requesting Permission!');
    requestPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  };

  useEffect(() => {
    checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  }, []);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.marginBottomSmall]}>
            Permissions
          </Text>
          <DataTable>
            {permissionStatus === RESULTS.BLOCKED && (
              <Text>
                Notifications have been blocked by your device. You'll need to enable them for this app in the Android settings.
              </Text>
            )}
            {permissionStatus !== RESULTS.BLOCKED && (
              <PrimaryActionButton
                buttonText={permissionStatus === RESULTS.GRANTED ? 'Already Enabled' : 'Enable'}
                onPress={handleEnable}
                disabled={permissionStatus === RESULTS.GRANTED}
              />
            )}
          </DataTable>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.marginBottomSmall]}>
            Notifications
          </Text>
          <Text variant={'bodyMedium'}>
            Pick the types of actions you want to receive as push notifications. This only controls what generates a
            notification on your device, not what to get notified for within Twitarr.
          </Text>
          {pushNotificationCategories.flatMap(c => (
            <SettingSwitch
              key={c.configKey}
              title={c.title}
              value={appConfig.pushNotifications[c.configKey]}
              onPress={() => toggleValue(c.configKey)}
              disabled={c.disabled}
            />
          ))}
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Enable All'}
            onPress={() => setAllValue(true)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Disable All'}
            onPress={() => setAllValue(false)}
          />
        </PaddedContentView>
        <Divider bold={true} />
      </ScrollingContentView>
    </AppView>
  );
};
