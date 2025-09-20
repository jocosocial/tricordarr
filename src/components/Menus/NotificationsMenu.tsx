import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {useState} from 'react';
import {useUserNotificationDataQuery} from '#src/Components/Queries/Alert/NotificationQueries.ts';
import {UserNotificationData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import pluralize from 'pluralize';
import {Linking} from 'react-native';
import {AppHeaderMenu} from './AppHeaderMenu.tsx';

export const NotificationsMenu = () => {
  const [visible, setVisible] = useState(false);
  const {data} = useUserNotificationDataQuery();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const anyNew = UserNotificationData.totalNewCount(data) !== 0;

  const handleUrl = (url: string) => {
    Linking.openURL(url);
    closeMenu();
  };

  return (
    <AppHeaderMenu
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
      <Divider bold={true} />
      <Menu.Item
        title={'Notification Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => handleUrl('tricordarr://settings/pushnotifications')}
      />
    </AppHeaderMenu>
  );
};
