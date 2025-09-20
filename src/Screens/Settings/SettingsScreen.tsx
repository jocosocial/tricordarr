import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {SettingsNavigationListItem} from '#src/Lists/Items/Settings/SettingsNavigationListItem.tsx';
import {SettingsAccountListItem} from '#src/Lists/Items/Settings/SettingsAccountListItem.tsx';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {ListSection} from '#src/Lists/ListSection.tsx';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/SettingsStackNavigator.tsx';
import {SettingsHeaderTitle} from '#src/Navigation/Components/SettingsHeaderTitle.tsx';
import {SettingsLoginListItem} from '#src/Lists/Items/Settings/SettingsLoginListItem.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {SettingsRegistrationListItem} from '#src/Lists/Items/Settings/SettingsRegistrationListItem.tsx';
import {ListSubheader} from '#src/Lists/ListSubheader.tsx';
import {CommonStackComponents} from '#src/Navigation/CommonScreens.tsx';

export type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.settings>;

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
              navComponent={SettingsStackScreenComponents.serverConnectionSettings}
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
          {appConfig.enableDeveloperOptions && (
            <>
              <Divider bold={true} />
              <ListSection>
                <ListSubheader>Developers</ListSubheader>
                <SettingsNavigationListItem
                  title={'App Version'}
                  description={'Show detailed version information about this app.'}
                  navComponent={SettingsStackScreenComponents.aboutSettingsScreen}
                />
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
                  title={'Disabled Features'}
                  description={'Show features that have been disabled by the server.'}
                  navComponent={SettingsStackScreenComponents.featureSettingsScreen}
                />
                <SettingsNavigationListItem
                  title={'Cruise'}
                  description={'Settings for the cruise.'}
                  navComponent={SettingsStackScreenComponents.cruiseSettingsScreen}
                />
                <SettingsNavigationListItem
                  title={'User Info'}
                  description={'Show internal state of user and auth information.'}
                  navComponent={SettingsStackScreenComponents.userInfoSettingsScreen}
                />
                <SettingsNavigationListItem
                  title={'Query Client'}
                  description={'Settings for the Twitarr API client.'}
                  navComponent={SettingsStackScreenComponents.querySettingsScreen}
                />
              </ListSection>
            </>
          )}
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
