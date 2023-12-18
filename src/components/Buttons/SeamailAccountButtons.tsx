import React, {useEffect, useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PrivilegedUserAccounts} from '../../libraries/Enums/UserAccessLevel';
import {AppIcons} from '../../libraries/Enums/Icons';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserNotificationData} from '../Context/Contexts/UserNotificationDataContext';
import {useAppTheme} from '../../styles/Theme';
import {AppIcon} from '../Icons/AppIcon';
import {SegmentedButtonType} from '../../libraries/Types';

export const SeamailAccountButtons = () => {
  const {profilePublicData} = useUserData();
  const {userNotificationData} = useUserNotificationData();
  const {clearPrivileges, becomeUser, hasModerator, hasTwitarrTeam, asPrivilegedUser} = usePrivilege();
  const [forUser, setForUser] = useState(asPrivilegedUser || profilePublicData?.header.username);
  const theme = useAppTheme();
  const [buttons, setButtons] = useState<SegmentedButtonType[]>([]);

  useEffect(() => {
    let tempButtons: SegmentedButtonType[] = [];
    if (hasModerator) {
      const moderatorIcon = userNotificationData?.moderatorData?.newModeratorSeamailMessageCount
        ? () => <AppIcon size={18} icon={AppIcons.notification} color={theme.colors.error} />
        : AppIcons.moderator;
      tempButtons.push({
        value: PrivilegedUserAccounts.moderator,
        label: 'Moderator',
        icon: moderatorIcon,
        onPress: () => becomeUser(PrivilegedUserAccounts.moderator),
      });
    }

    if (hasTwitarrTeam) {
      const twitarrTeamIcon = userNotificationData?.moderatorData?.newTTSeamailMessageCount
        ? () => <AppIcon size={18} icon={AppIcons.notification} color={theme.colors.error} />
        : AppIcons.moderator;
      tempButtons.push({
        value: PrivilegedUserAccounts.TwitarrTeam,
        label: 'TwitarrTeam',
        icon: twitarrTeamIcon,
        onPress: () => becomeUser(PrivilegedUserAccounts.TwitarrTeam),
      });
    }

    // All Privileged Users
    if (tempButtons.length !== 0 && profilePublicData) {
      tempButtons.unshift({
        value: profilePublicData.header.username,
        label: profilePublicData.header.displayName || profilePublicData.header.username,
        icon: userNotificationData?.newSeamailMessageCount ? AppIcons.notification : AppIcons.user,
        onPress: () => clearPrivileges(),
      });
    }

    setButtons(tempButtons);
  }, [
    becomeUser,
    clearPrivileges,
    hasModerator,
    hasTwitarrTeam,
    profilePublicData,
    theme.colors.error,
    userNotificationData?.moderatorData?.newModeratorSeamailMessageCount,
    userNotificationData?.moderatorData?.newTTSeamailMessageCount,
    userNotificationData?.newSeamailMessageCount,
  ]);

  if (buttons.length > 0 && forUser) {
    return <SegmentedButtons value={forUser} onValueChange={setForUser} buttons={buttons} />;
  }

  return <></>;
};
