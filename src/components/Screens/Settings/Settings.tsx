import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {SettingsNavigationListItem} from '../../Lists/Items/SettingsNavigationListItem';
import {AccountListItem} from '../../Lists/Items/AccountListItem';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {ListSection} from '../../Lists/ListSection';

export const SettingsView = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Network</List.Subheader>
            <SettingsNavigationListItem
              title={'Server URL'}
              description={'URL of the Twitarr server.'}
              navComponent={SettingsStackScreenComponents.configServerUrl}
            />
            <SettingsNavigationListItem
              title={'Background Connection'}
              description={'Manage the worker that maintains a connection to the server.'}
              navComponent={SettingsStackScreenComponents.serverConnectionSettings}
            />
            <SettingsNavigationListItem
              title={'WiFi Network'}
              description={'Configure the known SSID of the ship WiFi. This influences notification checking behavior.'}
              navComponent={SettingsStackScreenComponents.configShipSSID}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Account</List.Subheader>
            <AccountListItem />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Notifications</List.Subheader>
            <SettingsNavigationListItem
              title={'Push Notifications'}
              description={'Configure what events you wish to trigger a push notification.'}
              navComponent={SettingsStackScreenComponents.pushNotificationSettings}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Developers</List.Subheader>
            <SettingsNavigationListItem
              title={'Network Info'}
              description={"View details about your device's current network environment."}
              navComponent={SettingsStackScreenComponents.networkInfoSettings}
            />
            <SettingsNavigationListItem
              title={'Notifications'}
              description={'Generate a test notification for debugging.'}
              navComponent={SettingsStackScreenComponents.testNotification}
            />
            <SettingsNavigationListItem
              title={'Errors'}
              description={'Generate test error messages.'}
              navComponent={SettingsStackScreenComponents.testError}
            />
            <SettingsNavigationListItem
              title={'Notifications'}
              description={'Generate a test notification for debugging.'}
              navComponent={SettingsStackScreenComponents.testNotification}
            />
            <SettingsNavigationListItem
              title={'Sockets'}
              description={'Manage websocket internals.'}
              navComponent={SettingsStackScreenComponents.socketSettings}
            />
          </ListSection>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
