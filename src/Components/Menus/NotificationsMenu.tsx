import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import pluralize from 'pluralize';
import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useUserNotificationData} from '#src/Context/Contexts/UserNotificationDataContext';
import {AppIcons} from '#src/Enums/Icons';
import {useBackgroundConnectionStatus} from '#src/Hooks/useBackgroundConnectionStatus';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {BottomTabComponents, useBottomTabNavigator} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

const backgroundConnectionStatusLabels = {
  connected: 'Connected',
  warning: 'Warning',
  error: 'Error',
} as const;

/**
 * Builds a `leadingIcon` render prop for Menu.Item that draws a solid circle in the given
 * color, used to color-code the background connection status menu item.
 */
const renderBackgroundConnectionStatusIcon =
  (color: string) =>
  ({size}: {size: number}) => <MaterialCommunityIcons name={AppIcons.connection} size={size} color={color} />;

/** Header menu summarizing unread notification counts, with a shortcut to each destination. */
export const NotificationsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {preRegistrationMode} = usePreRegistration();
  const {data} = useUserNotificationDataQuery({enabled: !preRegistrationMode});
  const bottomTabNavigator = useBottomTabNavigator();
  const commonNavigation = useCommonStack();
  const {totalNewCount} = useUserNotificationData();
  const {theme} = useAppTheme();
  const backgroundConnectionStatus = useBackgroundConnectionStatus();

  const anyNew = totalNewCount(data) !== 0;

  const backgroundConnectionStatusColor = {
    connected: theme.colors.twitarrPositiveButton,
    warning: theme.colors.twitarrYellow,
    error: theme.colors.twitarrNegativeButton,
  }[backgroundConnectionStatus as 'connected' | 'warning' | 'error'];

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Item
          title={'Notifications'}
          iconName={anyNew ? AppIcons.notificationShow : AppIcons.notificationNone}
          onPress={openMenu}
        />
      }>
      {!anyNew && <Menu.Item leadingIcon={AppIcons.notificationNone} title={'No new notifications'} />}
      {!!data?.newAnnouncementCount && (
        <>
          <Menu.Item
            title={`${data?.newAnnouncementCount} new ${pluralize('announcement', data?.newAnnouncementCount)}`}
            titleNumberOfLines={0}
            leadingIcon={AppIcons.notificationShow}
            onPress={() =>
              bottomTabNavigator.navigate(BottomTabComponents.homeTab, {
                screen: MainStackComponents.mainScreen,
              })
            }
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.newForumMentionCount && (
        <>
          <Menu.Item
            title={`${data?.newForumMentionCount} new forum ${pluralize('mention', data?.newForumMentionCount)}`}
            titleNumberOfLines={0}
            leadingIcon={AppIcons.forum}
            onPress={() => commonNavigation.push(CommonStackComponents.forumPostMentionScreen)}
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.moderatorData?.newModeratorForumMentionCount && (
        <>
          <Menu.Item
            title={`${data.moderatorData.newModeratorForumMentionCount} new @moderator forum ${pluralize('mention', data.moderatorData.newModeratorForumMentionCount)}`}
            titleNumberOfLines={0}
            leadingIcon={AppIcons.moderator}
            onPress={() =>
              commonNavigation.push(CommonStackComponents.forumPostMentionScreen, {asPrivilegedUser: 'moderator'})
            }
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.moderatorData?.newTTForumMentionCount && (
        <>
          <Menu.Item
            title={`${data.moderatorData.newTTForumMentionCount} new @TwitarrTeam forum ${pluralize('mention', data.moderatorData.newTTForumMentionCount)}`}
            titleNumberOfLines={0}
            leadingIcon={AppIcons.twitarrteam}
            onPress={() =>
              commonNavigation.push(CommonStackComponents.forumPostMentionScreen, {asPrivilegedUser: 'TwitarrTeam'})
            }
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.addedToSeamailCount && (
        <Menu.Item
          title={`Added to ${data?.addedToSeamailCount} new ${pluralize('seamail', data?.addedToSeamailCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.seamail}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      {!!data?.newSeamailMessageCount && (
        <Menu.Item
          title={`${data?.newSeamailMessageCount} new seamail ${pluralize('message', data?.newSeamailMessageCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.seamail}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      {!!data?.moderatorData?.newModeratorSeamailMessageCount && (
        <Menu.Item
          title={`${data.moderatorData.newModeratorSeamailMessageCount} new @moderator ${pluralize('message', data.moderatorData.newModeratorSeamailMessageCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.moderator}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {
              onlyNew: true,
              asPrivilegedUser: 'moderator',
              noDrawer: true,
            })
          }
        />
      )}
      {!!data?.moderatorData?.newTTSeamailMessageCount && (
        <Menu.Item
          title={`${data.moderatorData.newTTSeamailMessageCount} new @TwitarrTeam ${pluralize('message', data.moderatorData.newTTSeamailMessageCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.twitarrteam}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {
              onlyNew: true,
              asPrivilegedUser: 'TwitarrTeam',
              noDrawer: true,
            })
          }
        />
      )}
      {!!data?.addedToLFGCount && (
        <Menu.Item
          title={`Added to ${data?.addedToLFGCount} new ${pluralize('LFG', data?.addedToLFGCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.lfg}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      {!!data?.newFezMessageCount && (
        <Menu.Item
          title={`${data?.newFezMessageCount} new ${pluralize('LFG', data?.newFezMessageCount)} messages`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.lfg}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      {!!data?.addedToPrivateEventCount && (
        <Menu.Item
          title={`Added to ${data?.addedToPrivateEventCount} new private ${pluralize('event', data?.addedToPrivateEventCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.personalEvent}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      {!!data?.newPrivateEventMessageCount && (
        <Menu.Item
          title={`${data?.newPrivateEventMessageCount} new private event ${pluralize('message', data?.newPrivateEventMessageCount)}`}
          titleNumberOfLines={0}
          leadingIcon={AppIcons.personalEvent}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.seamailListScreen, {onlyNew: true, noDrawer: true})
          }
        />
      )}
      <Divider bold={true} />
      {backgroundConnectionStatus !== 'disabled' && (
        <Menu.Item
          title={backgroundConnectionStatusLabels[backgroundConnectionStatus]}
          leadingIcon={renderBackgroundConnectionStatusIcon(backgroundConnectionStatusColor)}
          onPress={() =>
            bottomTabNavigator.navigate(BottomTabComponents.homeTab, {
              screen: MainStackComponents.mainSettingsScreen,
              params: {
                screen: SettingsStackScreenComponents.backgroundConnectionSettings,
              },
            })
          }
        />
      )}
      <Menu.Item
        title={'Notification Log'}
        leadingIcon={AppIcons.logView}
        onPress={() => commonNavigation.push(CommonStackComponents.notificationLogScreen)}
      />
      <Menu.Item
        title={'Notification Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() =>
          bottomTabNavigator.navigate(BottomTabComponents.homeTab, {
            screen: MainStackComponents.mainSettingsScreen,
            params: {
              screen: SettingsStackScreenComponents.pushNotificationSettings,
              params: {},
            },
          })
        }
      />
    </AppMenu>
  );
};
