import React, {useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PrivilegedUserAccounts, UserAccessLevel} from '../../libraries/Enums/UserAccessLevel';
import {AppIcons} from '../../libraries/Enums/Icons';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';

export const SeamailAccountButtons = () => {
  const {profilePublicData, accessLevel} = useUserData();
  const [forUser, setForUser] = useState(profilePublicData.header.username);
  const {clearPrivileges, becomeUser} = usePrivilege();

  let buttons = [];

  // Moderator
  if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator)) {
    buttons.push({
      value: PrivilegedUserAccounts.moderator,
      label: 'Moderator',
      icon: AppIcons.moderator,
      onPress: () => becomeUser(PrivilegedUserAccounts.moderator),
    });
  }

  // TwitarrTeam
  if (UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.twitarrteam)) {
    buttons.push({
      value: PrivilegedUserAccounts.TwitarrTeam,
      label: 'TwitarrTeam',
      icon: AppIcons.twitarteam,
      onPress: () => becomeUser(PrivilegedUserAccounts.TwitarrTeam),
    });
  }

  // All Privileged Users
  if (buttons.length !== 0) {
    buttons.unshift({
      value: profilePublicData.header.username,
      label: profilePublicData.header.displayName || profilePublicData.header.username,
      icon: AppIcons.user,
      onPress: () => clearPrivileges(),
    });
  }

  if (buttons.length > 0) {
    return <SegmentedButtons value={forUser} onValueChange={setForUser} buttons={buttons} />;
  }

  return <></>;
};
