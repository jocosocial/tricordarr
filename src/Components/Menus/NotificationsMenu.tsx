import pluralize from 'pluralize';
import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useTwitarr} from '#src/Context/Contexts/TwitarrContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

export const NotificationsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {preRegistrationMode} = usePreRegistration();
  const {data} = useUserNotificationDataQuery({enabled: !preRegistrationMode});
  const {openAppUrl} = useTwitarr();

  const anyNew = UserNotificationData.totalNewCount(data) !== 0;

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
            onPress={() => openAppUrl('tricordarr://home')}
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.newForumMentionCount && (
        <>
          <Menu.Item
            title={`${data?.newForumMentionCount} new forum ${pluralize('mention', data?.newForumMentionCount)}`}
            leadingIcon={AppIcons.forum}
            onPress={() => openAppUrl('tricordarr://forumpost/mentions')}
          />
          <Divider bold={true} />
        </>
      )}
      {!!data?.addedToSeamailCount && (
        <Menu.Item
          title={`Added to ${data?.addedToSeamailCount} new ${pluralize('seamail', data?.addedToSeamailCount)}`}
          leadingIcon={AppIcons.seamail}
          onPress={() => openAppUrl('tricordarr://seamail', {onlyNew: true})}
        />
      )}
      {!!data?.newSeamailMessageCount && (
        <Menu.Item
          title={`${data?.newSeamailMessageCount} new seamail ${pluralize('message', data?.newSeamailMessageCount)}`}
          leadingIcon={AppIcons.seamail}
          onPress={() => openAppUrl('tricordarr://seamail', {onlyNew: true})}
        />
      )}
      {/* 
      We have no way to list "new LFGs you've been added to" in the API.
      Only unread messages. So this is disabled until we can.
      {!!data?.addedToLFGCount && (
        <Menu.Item
          title={`Added to ${data?.addedToLFGCount} new ${pluralize('LFG', data?.addedToLFGCount)}`}
          leadingIcon={AppIcons.lfg}
          onPress={() => openAppUrl('tricordarr://lfg/joined', {onlyNew: true})}
        />
      )} */}
      {!!data?.newFezMessageCount && (
        <Menu.Item
          title={`${data?.newFezMessageCount} new ${pluralize('LFG', data?.newFezMessageCount)} messages`}
          leadingIcon={AppIcons.lfg}
          onPress={() => openAppUrl('tricordarr://lfg/joined', {onlyNew: true})}
        />
      )}
      {/* {!!data?.addedToPrivateEventCount && (
        <Menu.Item
          title={`Added to ${data?.addedToPrivateEventCount} new private ${pluralize('event', data?.addedToPrivateEventCount)}`}
          leadingIcon={AppIcons.personalEvent}
          onPress={() => openAppUrl('tricordarr://privateevent/list')}
        />
      )} */}
      {!!data?.newPrivateEventMessageCount && (
        <Menu.Item
          title={`${data?.newPrivateEventMessageCount} new private event ${pluralize('message', data?.newPrivateEventMessageCount)}`}
          leadingIcon={AppIcons.personalEvent}
          onPress={() => openAppUrl('tricordarr://privateevent/list')}
        />
      )}
      <Divider bold={true} />
      <Menu.Item
        title={'Notification Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => openAppUrl('tricordarr://settings/pushnotifications')}
      />
    </AppMenu>
  );
};
