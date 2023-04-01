import React from 'react';
import {View} from 'react-native';
import {List, Divider} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {SettingListItem} from '../../Lists/Items/SettingListItem';
import {NavigationListItem} from '../../Lists/Items/NavigationListItem';
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
            <SettingListItem setting={AppSettings.SERVER_URL} />
            <NavigationListItem
              title={'Background Connection'}
              description={'Manage the worker that maintains a connection to the server.'}
              navComponent={SettingsStackScreenComponents.serverConnectionSettings}
            />
            <SettingListItem setting={AppSettings.SHIP_SSID} />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Account</List.Subheader>
            <AccountListItem />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
            <List.Subheader>Tests</List.Subheader>
            <NavigationListItem
              title={'Notifications'}
              description={'Generate a test notification for debugging.'}
              navComponent={SettingsStackScreenComponents.testNotification}
            />
            <NavigationListItem
              title={'Errors'}
              description={'Generate test error messages.'}
              navComponent={SettingsStackScreenComponents.testError}
            />
          </ListSection>
          <Divider bold={true} />
          <ListSection>
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
          </ListSection>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
