import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {SettingsNavigationListItem} from '../../Lists/Items/SettingsNavigationListItem';
import {AccountListItem} from '../../Lists/Items/AccountListItem';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {ListSection} from '../../Lists/ListSection';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';
import {SettingsHeaderTitle} from '../../Navigation/Components/SettingsHeaderTitle';

export type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.settings,
  NavigatorIDs.settingsStack
>;

export const SettingsScreen = ({navigation}: Props) => {
  const {appConfig} = useConfig();
  const getHeaderTitle = useCallback(() => <SettingsHeaderTitle />, []);

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
            <List.Subheader>Network</List.Subheader>
            <SettingsNavigationListItem
              title={'Server URL'}
              description={'URL of the Twitarr server.'}
              navComponent={SettingsStackScreenComponents.configServerUrl}
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
            <List.Subheader>Content</List.Subheader>
            <SettingsNavigationListItem
              title={'Alert Keywords'}
              description={'Manage keywords that will generate a notification.'}
              navComponent={SettingsStackScreenComponents.alertKeywords}
            />
            <SettingsNavigationListItem
              title={'Mute Keywords'}
              description={'Manage keywords that will mute content.'}
              navComponent={SettingsStackScreenComponents.muteKeywords}
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
          </ListSection>
          {appConfig.enableDeveloperOptions && (
            <>
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
                  title={'Background Connection'}
                  description={'Manage the worker that maintains a connection to the server.'}
                  navComponent={SettingsStackScreenComponents.serverConnectionSettings}
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
