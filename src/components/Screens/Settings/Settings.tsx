import React from 'react';
import {View} from 'react-native';
import {List, Divider} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {SettingListItem} from '../../Lists/SettingListItem';
import {NavigationListItem} from '../../Lists/NavigationListItem';
import {AccountListItem} from '../../Lists/AccountListItem';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';

export const SettingsView = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Network</List.Subheader>
            <SettingListItem setting={AppSettings.SERVER_URL} />
            <NavigationListItem
              title={'Background Connection'}
              description={'Manage the worker that maintains a connection to the server.'}
              navComponent={SettingsStackScreenComponents.serverConnectionSettings}
            />
            <SettingListItem setting={AppSettings.SHIP_SSID} />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            <AccountListItem />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Notifications</List.Subheader>
            <NavigationListItem
              title={'Test Notification'}
              description={'Generate a test notification for debugging.'}
              navComponent={SettingsStackScreenComponents.testNotification}
            />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>About</List.Subheader>
            <NavigationListItem
              title={'Network Info'}
              description={"View details about your device's current network environment."}
              navComponent={SettingsStackScreenComponents.networkInfoSettings}
            />
            <NavigationListItem
              title={'Storage Keys'}
              description={'View the contents of internal app storage.'}
              navComponent={SettingsStackScreenComponents.storageKeySettings}
            />
            <List.Item title={'App Information'} />
          </List.Section>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
