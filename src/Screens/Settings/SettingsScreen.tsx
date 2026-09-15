import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {SettingsAccountListItem} from '#src/Components/Lists/Items/Settings/SettingsAccountListItem';
import {SettingsLoginListItem} from '#src/Components/Lists/Items/Settings/SettingsLoginListItem';
import {SettingsRegistrationListItem} from '#src/Components/Lists/Items/Settings/SettingsRegistrationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {SettingsHeaderTitle} from '#src/Components/Navigation/SettingsHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

export type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.settings>;

export const SettingsScreen = ({navigation}: Props) => {
  const {appConfig} = useConfig();
  const getHeaderTitle = useCallback(() => <SettingsHeaderTitle />, []);
  const {currentSession} = useSession();
  const tokenData = currentSession?.tokenData || null;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: getHeaderTitle,
    });
  }, [getHeaderTitle, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>General</ListSubheader>
            {tokenData ? <SettingsAccountListItem /> : <SettingsLoginListItem />}
            {!tokenData && <SettingsRegistrationListItem />}
            <NavigationListItem
              title={'Server URL'}
              description={'URL of the Twitarr server.'}
              navComponent={CommonStackComponents.configServerUrl}
            />
            <NavigationListItem
              title={'Appearance'}
              description={'Theme and styling options for this app.'}
              navComponent={CommonStackComponents.accessibilitySettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Notifications</ListSubheader>
            <NavigationListItem
              title={'Push Notifications'}
              description={'Configure what events you wish to trigger a push notification.'}
              navComponent={SettingsStackScreenComponents.pushNotificationSettings}
            />
            <NavigationListItem
              title={'Background Worker'}
              description={'Manage the worker that maintains a connection to the server when this app is not running.'}
              navComponent={SettingsStackScreenComponents.backgroundConnectionSettings}
            />
            <NavigationListItem
              title={'Polling'}
              description={'Configure periodic notification updates that happen while the app is running.'}
              navComponent={SettingsStackScreenComponents.notificationPollerSettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Content</ListSubheader>
            <NavigationListItem
              title={'Chat Settings'}
              description={'Settings for Seamail and KrakenTalk.'}
              navComponent={CommonStackComponents.chatSettingsScreen}
            />
            <NavigationListItem
              title={'Forum Settings'}
              description={'Settings for Forum threads and categories.'}
              navComponent={CommonStackComponents.forumSettingsScreen}
            />
            <NavigationListItem
              title={'Image Settings'}
              description={'Manage settings for images.'}
              navComponent={CommonStackComponents.imageSettingsScreen}
            />
            <NavigationListItem
              title={'LFG Settings'}
              description={'Settings for community organized events.'}
              navComponent={CommonStackComponents.lfgSettingsScreen}
            />
            <NavigationListItem
              title={'Schedule Settings'}
              description={'Settings related to the day and schedule.'}
              navComponent={CommonStackComponents.eventSettingsScreen}
            />
            <NavigationListItem
              title={'Share Settings'}
              description={'Setings for sharing content with other users and apps.'}
              navComponent={CommonStackComponents.shareSettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Troubleshooting</ListSubheader>
            <NavigationListItem
              title={'Logging'}
              description={'Configure app logging and export log files.'}
              navComponent={SettingsStackScreenComponents.loggingSettings}
            />
            <NavigationListItem
              title={'Time'}
              description={'Clock and time settings for this app.'}
              navComponent={SettingsStackScreenComponents.timeSettingsScreen}
            />
            <NavigationListItem
              title={'Cruise Settings'}
              description={'Settings for the cruise.'}
              navComponent={SettingsStackScreenComponents.cruiseSettingsScreen}
            />
            <NavigationListItem
              title={'Manage Features'}
              description={'Show server feature state and manage experiments.'}
              navComponent={SettingsStackScreenComponents.featureSettingsScreen}
            />
            <NavigationListItem
              title={'Query Client'}
              description={'Settings for the Twitarr API client.'}
              navComponent={SettingsStackScreenComponents.querySettingsScreen}
            />
            <NavigationListItem
              title={'Sessions'}
              description={'Manage local account sessions.'}
              navComponent={SettingsStackScreenComponents.sessionSettings}
            />
            <NavigationListItem
              title={'About'}
              description={'Show version information about this app and your device.'}
              navComponent={SettingsStackScreenComponents.aboutSettingsScreen}
            />
          </ListSection>
          {appConfig.enableDeveloperOptions && (
            <>
              <Divider bold={true} />
              <ListSection>
                <ListSubheader>Developers</ListSubheader>
                <NavigationListItem
                  title={'Test Notifications'}
                  description={'Generate a test notification for debugging.'}
                  navComponent={SettingsStackScreenComponents.testNotification}
                />
                <NavigationListItem
                  title={'Errors'}
                  description={'Generate test error messages.'}
                  navComponent={SettingsStackScreenComponents.testError}
                />
                <NavigationListItem
                  title={'Sockets'}
                  description={'Manage websocket internals.'}
                  navComponent={SettingsStackScreenComponents.socketSettings}
                />
                <NavigationListItem
                  title={'Out-of-box Experience'}
                  description={'Internal OOBE information.'}
                  navComponent={SettingsStackScreenComponents.oobeSettings}
                />
              </ListSection>
            </>
          )}
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
