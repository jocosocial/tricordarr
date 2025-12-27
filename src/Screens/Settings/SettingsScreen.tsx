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
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

export type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.settings>;

export const SettingsScreen = ({navigation}: Props) => {
  const {appConfig} = useConfig();
  const getHeaderTitle = useCallback(() => <SettingsHeaderTitle />, []);
  const {tokenData} = useAuth();

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
              title={'Accessibility'}
              description={'Theme and styling options for this app.'}
              navComponent={CommonStackComponents.accessibilitySettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Time'}
              description={'Clock and time settings for this app.'}
              navComponent={SettingsStackScreenComponents.timeSettingsScreen}
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
              title={'Schedule Settings'}
              description={'Settings related to the day and schedule.'}
              navComponent={SettingsStackScreenComponents.eventSettings}
            />
            <SettingsNavigationListItem
              title={'LFG Settings'}
              description={'Settings for community organized events.'}
              navComponent={SettingsStackScreenComponents.lfgSettings}
            />
            <SettingsNavigationListItem
              title={'Image Settings'}
              description={'Manage settings for images.'}
              navComponent={CommonStackComponents.imageSettingsScreen}
            />
            <SettingsNavigationListItem
              title={'Forum Settings'}
              description={'Settings for Forum threads and categories.'}
              navComponent={CommonStackComponents.forumSettingsScreen}
            />
          </ListSection>
          <ListSection>
            <ListSubheader>Troubleshooting</ListSubheader>
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
                  title={'Network Info'}
                  description={"View details about your device's current network environment."}
                  navComponent={SettingsStackScreenComponents.networkInfoSettings}
                />
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
                <SettingsNavigationListItem
                  title={'User Info'}
                  description={'Show internal state of user and auth information.'}
                  navComponent={SettingsStackScreenComponents.userInfoSettingsScreen}
                />
              </ListSection>
            </>
          )}
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
