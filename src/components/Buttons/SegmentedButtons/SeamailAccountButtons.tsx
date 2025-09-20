import React, {useEffect, useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {AppIcons} from '#src/Enums/Icons';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useAppTheme} from '#src/Styles/Theme';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {SegmentedButtonType} from '#src/Types';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const SeamailAccountButtons = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  const {clearPrivileges, becomeUser, hasModerator, hasTwitarrTeam, asPrivilegedUser} = usePrivilege();
  const [forUser, setForUser] = useState(asPrivilegedUser || profilePublicData?.header.username);
  const theme = useAppTheme();
  const [buttons, setButtons] = useState<SegmentedButtonType[]>([]);

  useEffect(() => {
    let tempButtons: SegmentedButtonType[] = [];
    if (hasModerator) {
      const moderatorIcon = userNotificationData?.moderatorData?.newModeratorSeamailMessageCount
        ? () => <AppIcon size={18} icon={AppIcons.notificationShow} color={theme.colors.error} />
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
        ? () => <AppIcon size={18} icon={AppIcons.notificationShow} color={theme.colors.error} />
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
        icon: userNotificationData?.newSeamailMessageCount ? AppIcons.notificationShow : AppIcons.user,
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
