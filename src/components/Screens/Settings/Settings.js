import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useContext} from 'react';
import {useTheme, List, Divider} from 'react-native-paper';
import {AppSettings} from '../../../libraries/AppSettings';
import {SettingListItem} from '../../Lists/SettingListItem';
import {PERMISSIONS} from 'react-native-permissions';
import {PermissionListItem} from "../../Lists/PermissionListItem";
import {AppPermissions} from "../../../libraries/AppPermissions";
import {NavigationListItem} from "../../Lists/NavigationListItem";
import {AccountListItem} from "../../Lists/AccountListItem";

export const SettingsView = ({navigation}) => {
  const theme = useTheme();
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{backgroundColor: theme.colors.background}}>
          <List.Section>
            <List.Subheader>Permissions</List.Subheader>
            {/*<SettingListItem setting={Settings.ENABLE_NOTIFICATIONS} navComponent={'NotificationSettings'} />*/}
            <PermissionListItem appPermission={AppPermissions.NOTIFICATIONS} />
            <PermissionListItem appPermission={AppPermissions.LOCATION} />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Network</List.Subheader>
            <SettingListItem setting={AppSettings.SERVER_URL} />
            <NavigationListItem
              title={'Server Connection'}
              description={'Manage the worker that maintains a connection to the server.'}
              navComponent={'ServerConnectionSettings'}
            />
          </List.Section>
          <Divider bold={true} />
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            <AccountListItem />
          </List.Section>
          <Divider bold={true} />
          {/*<List.Section>*/}
          {/*  <List.Subheader>Preferences</List.Subheader>*/}
          {/*  <List.Item title={'SoonTM'} />*/}
          {/*</List.Section>*/}
          {/*<Divider bold={true} />*/}
          <List.Section>
            <List.Subheader>About</List.Subheader>
            <NavigationListItem
              title={'Network Info'}
              description={"View details about your device's current network environment."}
              navComponent={'NetworkInfoSettings'}
            />
            <NavigationListItem
              title={'Storage Keys'}
              description={'View the contents of internal app storage.'}
              navComponent={'StorageKeysSettings'}
            />
            <List.Item title={'App Information'} />
          </List.Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
