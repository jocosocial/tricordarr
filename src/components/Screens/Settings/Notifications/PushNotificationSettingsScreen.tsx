import React from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../../Switches/SettingSwitch';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {PushNotificationConfig} from '../../../../libraries/AppConfig';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';

interface NotificationCategory {
  configKey: keyof PushNotificationConfig;
  title: string;
}

export const PushNotificationSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const theme = useAppTheme();

  const pushNotificationCategories: NotificationCategory[] = [
    {configKey: 'announcement', title: 'Announcements'},
    {configKey: 'seamailUnreadMsg', title: 'Seamails'},
    {configKey: 'fezUnreadMsg', title: 'LFG posts'},
    {configKey: 'alertwordPost', title: 'Forum Alert Words'},
    {configKey: 'forumMention', title: 'Forum Mentions'},
    {configKey: 'nextFollowedEventTime', title: 'Events'},
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
      (pushConfig[c.configKey] as boolean) = value;
    });
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          {pushNotificationCategories.flatMap(c => (
            <SettingSwitch
              key={c.configKey}
              title={c.title}
              value={appConfig.pushNotifications[c.configKey]}
              onPress={() => toggleValue(c.configKey)}
            />
          ))}
        </PaddedContentView>
        <PaddedContentView>
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
      </ScrollingContentView>
    </AppView>
  );
};
