import pluralize from 'pluralize';
import * as React from 'react';
import {Linking} from 'react-native';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

export const NotificationsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {appConfig} = useConfig();
  const {data} = useUserNotificationDataQuery({enabled: !appConfig.preRegistrationMode});

  const anyNew = UserNotificationData.totalNewCount(data) !== 0;

  const handleUrl = (url: string) => {
    Linking.openURL(url);
    closeMenu();
  };

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
            leadingIcon={AppIcons.notificationShow}
            onPress={() => handleUrl('tricordarr://home')}
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.newForumMentionCount && (
        <>
          <Menu.Item
            title={`${data?.newForumMentionCount} new forum ${pluralize('mention', data?.newForumMentionCount)}`}
            leadingIcon={AppIcons.forum}
            onPress={() => handleUrl('tricordarr://forumpost/mentions')}
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.addedToSeamailCount && (
        <Menu.Item
          title={`Added to ${data?.addedToSeamailCount} new ${pluralize('seamail', data?.addedToSeamailCount)}`}
          leadingIcon={AppIcons.seamail}
          onPress={() => handleUrl('tricordarr://seamail')}
        />
      )}
      {!!data?.newSeamailMessageCount && (
        <Menu.Item
          title={`${data?.newSeamailMessageCount} new seamail messages`}
          leadingIcon={AppIcons.seamail}
          onPress={() => handleUrl('tricordarr://seamail')}
        />
      )}
      {!!data?.addedToLFGCount && (
        <Menu.Item
          title={`Added to ${data?.addedToLFGCount} new ${pluralize('LFG', data?.addedToLFGCount)}`}
          leadingIcon={AppIcons.lfg}
          onPress={() => handleUrl('tricordarr://lfg/joined')}
        />
      )}
      {!!data?.newFezMessageCount && (
        <Menu.Item
          title={`${data?.newFezMessageCount} new ${pluralize('LFG', data?.newFezMessageCount)} messages`}
          leadingIcon={AppIcons.lfg}
          onPress={() => handleUrl('tricordarr://lfg/joined')}
        />
      )}
      {!!data?.addedToPrivateEventCount && (
        <Menu.Item
          title={`Added to ${data?.addedToPrivateEventCount} new private ${pluralize('event', data?.addedToPrivateEventCount)}`}
          leadingIcon={AppIcons.personalEvent}
          onPress={() => handleUrl('tricordarr://privateevent/list')}
        />
      )}
      {!!data?.newPrivateEventMessageCount && (
        <Menu.Item
          title={`${data?.newPrivateEventMessageCount} new private event ${pluralize('message', data?.newPrivateEventMessageCount)}`}
          leadingIcon={AppIcons.personalEvent}
          onPress={() => handleUrl('tricordarr://privateevent/list')}
        />
      )}
      <Divider bold={true} />
      <Menu.Item
        title={'Notification Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => handleUrl('tricordarr://settings/pushnotifications')}
      />
    </AppMenu>
  );
};
