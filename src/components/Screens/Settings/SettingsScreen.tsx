import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {SettingsNavigationListItem} from '../../Lists/Items/Settings/SettingsNavigationListItem';
import {SettingsAccountListItem} from '../../Lists/Items/Settings/SettingsAccountListItem';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {ListSection} from '../../Lists/ListSection';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';
import {SettingsHeaderTitle} from '../../Navigation/Components/SettingsHeaderTitle';
import {SettingsLoginListItem} from '../../Lists/Items/Settings/SettingsLoginListItem';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {SettingsRegistrationListItem} from '../../Lists/Items/Settings/SettingsRegistrationListItem';
import {ListSubheader} from '../../Lists/ListSubheader';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

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
            <ListSubheader>Account</ListSubheader>
            {tokenData ? <SettingsAccountListItem /> : <SettingsLoginListItem />}
            {!tokenData && <SettingsRegistrationListItem />}
            <SettingsNavigationListItem
              title={'Server URL'}
              description={'URL of the Twitarr server.'}
              navComponent={CommonStackComponents.configServerUrl}
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
              title={'Alert Keywords'}
              description={'Manage keywords that will generate a notification.'}
              navComponent={CommonStackComponents.alertKeywords}
            />
            <SettingsNavigationListItem
              title={'Mute Keywords'}
              description={'Manage keywords that will mute content.'}
              navComponent={CommonStackComponents.muteKeywords}
            />
            <SettingsNavigationListItem
              title={'Blocked Users'}
              description={'Users that cannot see your content.'}
              navComponent={SettingsStackScreenComponents.blockUsers}
            />
            <SettingsNavigationListItem
              title={'Muted Users'}
              description={'Users whose content you will not see.'}
              navComponent={SettingsStackScreenComponents.muteUsers}
            />
            <SettingsNavigationListItem
              title={'Favorite Users'}
              description={'Quickly access friends profiles.'}
              navComponent={SettingsStackScreenComponents.favoriteUsers}
            />
            <SettingsNavigationListItem
              title={'Event Settings'}
              description={'Settings for official and shadow event schedule.'}
              navComponent={SettingsStackScreenComponents.eventSettings}
            />
            <SettingsNavigationListItem
              title={'LFG Settings'}
              description={'Settings for community organized events.'}
              navComponent={SettingsStackScreenComponents.lfgSettings}
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
