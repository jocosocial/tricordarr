import React, {useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PrivilegedUserAccounts} from '../../libraries/Enums/UserAccessLevel';
import {AppIcons} from '../../libraries/Enums/Icons';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserNotificationData} from '../Context/Contexts/UserNotificationDataContext';

export const SeamailAccountButtons = () => {
  const {profilePublicData} = useUserData();
  const {userNotificationData} = useUserNotificationData();
  const [forUser, setForUser] = useState(profilePublicData?.header.username || '');
  const {clearPrivileges, becomeUser, hasModerator, hasTwitarrTeam} = usePrivilege();

  let buttons = [];

  if (hasModerator) {
    buttons.push({
      value: PrivilegedUserAccounts.moderator,
      label: 'Moderator',
      icon: userNotificationData?.moderatorData?.newModeratorSeamailMessageCount
        ? AppIcons.notification
        : AppIcons.moderator,
      onPress: () => becomeUser(PrivilegedUserAccounts.moderator),
    });
  }

  if (hasTwitarrTeam) {
    buttons.push({
      value: PrivilegedUserAccounts.TwitarrTeam,
      label: 'TwitarrTeam',
      icon: userNotificationData?.moderatorData?.newTTSeamailMessageCount ? AppIcons.notification : AppIcons.twitarteam,
      onPress: () => becomeUser(PrivilegedUserAccounts.TwitarrTeam),
    });
  }

  // All Privileged Users
  if (buttons.length !== 0 && profilePublicData) {
    buttons.unshift({
      value: profilePublicData.header.username,
      label: profilePublicData.header.displayName || profilePublicData.header.username,
      icon: userNotificationData?.newSeamailMessageCount ? AppIcons.notification : AppIcons.user,
      onPress: () => clearPrivileges(),
    });
  }

  if (buttons.length > 0) {
    return <SegmentedButtons value={forUser} onValueChange={setForUser} buttons={buttons} />;
  }

  return <></>;
};
