import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useContext} from 'react';
import {useTheme, List, Divider} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {SettingListItem} from '../../Lists/SettingListItem';
import {NavigationListItem} from '../../Lists/NavigationListItem';
import {AccountListItem} from '../../Lists/AccountListItem';
import {AppView} from '../../Views/AppView';

export const SettingsView = ({navigation}) => {
  const theme = useTheme();
  return (
    <AppView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Network</List.Subheader>
            <SettingListItem setting={AppSettings.SERVER_URL} />
            <NavigationListItem
              title={'Background Connection'}
              description={'Manage the worker that maintains a connection to the server.'}
              navComponent={'ServerConnectionSettingsScreen'}
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
              navComponent={'TestNotificationScreen'}
            />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>About</List.Subheader>
            <NavigationListItem
              title={'Network Info'}
              description={"View details about your device's current network environment."}
              navComponent={'NetworkInfoSettingsScreen'}
            />
            <NavigationListItem
              title={'Storage Keys'}
              description={'View the contents of internal app storage.'}
              navComponent={'StorageKeysSettingsScreen'}
            />
            <List.Item title={'App Information'} />
          </List.Section>
        </View>
      </ScrollView>
    </AppView>
  );
};
