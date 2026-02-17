import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';

import {SettingsAccountListItem} from '#src/Components/Lists/Items/Settings/SettingsAccountListItem';
import {SettingsLoginListItem} from '#src/Components/Lists/Items/Settings/SettingsLoginListItem';
import {SettingsNavigationListItem} from '#src/Components/Lists/Items/Settings/SettingsNavigationListItem';
import {SettingsRegistrationListItem} from '#src/Components/Lists/Items/Settings/SettingsRegistrationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {SettingsHeaderTitle} from '#src/Components/Navigation/SettingsHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

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
            <SettingsNavigationListItem
              title={'Server URL'}
              description={'URL of the Twitarr server.'}
              navComponent={CommonStackComponents.configServerUrl}
            />
            <SettingsNavigationListItem
              title={'Appearance'}
              description={'Theme and styling options for this app.'}
              navComponent={CommonStackComponents.accessibilitySettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Notifications</ListSubheader>
            <SettingsNavigationListItem
              title={'Push Notifications'}
              description={'Configure what events you wish to trigger a push notification.'}
              navComponent={SettingsStackScreenComponents.pushNotificationSettings}
            />
            <SettingsNavigationListItem
              title={'Background Worker'}
              description={'Manage the worker that maintains a connection to the server when this app is not running.'}
              navComponent={SettingsStackScreenComponents.backgroundConnectionSettings}
            />
            <SettingsNavigationListItem
              title={'Polling'}
              description={'Configure periodic notification updates that happen while the app is running.'}
              navComponent={SettingsStackScreenComponents.notificationPollerSettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Content</ListSubheader>
            <SettingsNavigationListItem
              title={'Forum Settings'}
              description={'Settings for Forum threads and categories.'}
              navComponent={CommonStackComponents.forumSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Image Settings'}
              description={'Manage settings for images.'}
              navComponent={CommonStackComponents.imageSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'LFG Settings'}
              description={'Settings for community organized events.'}
              navComponent={CommonStackComponents.lfgSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Schedule Settings'}
              description={'Settings related to the day and schedule.'}
              navComponent={CommonStackComponents.eventSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Seamail Settings'}
              description={'Settings for Seamail conversations.'}
              navComponent={CommonStackComponents.seamailSettingsScreen}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <ListSubheader>Troubleshooting</ListSubheader>
            <SettingsNavigationListItem
              title={'Logging'}
              description={'Configure app logging and export log files.'}
              navComponent={SettingsStackScreenComponents.loggingSettings}
            />
            <SettingsNavigationListItem
              title={'Time'}
              description={'Clock and time settings for this app.'}
              navComponent={SettingsStackScreenComponents.timeSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Cruise Settings'}
              description={'Settings for the cruise.'}
              navComponent={SettingsStackScreenComponents.cruiseSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Manage Features'}
              description={'Show server feature state and manage experiments.'}
              navComponent={SettingsStackScreenComponents.featureSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Query Client'}
              description={'Settings for the Twitarr API client.'}
              navComponent={SettingsStackScreenComponents.querySettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Sessions'}
              description={'Manage local account sessions.'}
              navComponent={SettingsStackScreenComponents.sessionSettings}
            />
            <SettingsNavigationListItem
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
                <SettingsNavigationListItem
                  title={'Test Notifications'}
                  description={'Generate a test notification for debugging.'}
                  navComponent={SettingsStackScreenComponents.testNotification}
                />
                <SettingsNavigationListItem
                  title={'Errors'}
                  description={'Generate test error messages.'}
                  navComponent={SettingsStackScreenComponents.testError}
                />
                <SettingsNavigationListItem
                  title={'Sockets'}
                  description={'Manage websocket internals.'}
                  navComponent={SettingsStackScreenComponents.socketSettings}
                />
                <SettingsNavigationListItem
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
