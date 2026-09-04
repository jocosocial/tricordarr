import React, {useEffect, useState} from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {SegmentedButtonType} from '#src/Types';

interface PrivilegedAccountButtonsProps {
  selfNotificationCount?: number;
  moderatorNotificationCount?: number;
  twitarrTeamNotificationCount?: number;
  testIDPrefix?: string;
}

/**
 * Privilege-gated Self / Moderator / TwitarrTeam switcher. Updates elevation so the
 * current screen can query and post as the selected identity.
 */
export const PrivilegedAccountButtons = ({
  selfNotificationCount,
  moderatorNotificationCount,
  twitarrTeamNotificationCount,
  testIDPrefix = 'privilegedAccount',
}: PrivilegedAccountButtonsProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {asPrivilegedUser, becomeUser, clearElevation} = useElevation();
  const [forUser, setForUser] = useState(asPrivilegedUser || profilePublicData?.header.username);
  const {theme} = useAppTheme();
  const [buttons, setButtons] = useState<SegmentedButtonType[]>([]);

  useEffect(() => {
    setForUser(asPrivilegedUser || profilePublicData?.header.username);
  }, [asPrivilegedUser, profilePublicData?.header.username]);

  useEffect(() => {
    let tempButtons: SegmentedButtonType[] = [];
    if (hasModerator) {
      const moderatorIcon = moderatorNotificationCount
        ? () => <AppIcon size={18} icon={AppIcons.notificationShow} color={theme.colors.error} />
        : AppIcons.moderator;
      tempButtons.push({
        value: PrivilegedUserAccounts.moderator,
        label: 'Moderator',
        icon: moderatorIcon,
        onPress: () => becomeUser(PrivilegedUserAccounts.moderator),
        testID: `${testIDPrefix}Moderator-button`,
      });
    }

    if (hasTwitarrTeam) {
      const twitarrTeamIcon = twitarrTeamNotificationCount
        ? () => <AppIcon size={18} icon={AppIcons.notificationShow} color={theme.colors.error} />
        : AppIcons.twitarrteam;
      tempButtons.push({
        value: PrivilegedUserAccounts.TwitarrTeam,
        label: 'TwitarrTeam',
        icon: twitarrTeamIcon,
        onPress: () => becomeUser(PrivilegedUserAccounts.TwitarrTeam),
        testID: `${testIDPrefix}TwitarrTeam-button`,
      });
    }

    if (tempButtons.length !== 0 && profilePublicData) {
      tempButtons.unshift({
        value: profilePublicData.header.username,
        label: profilePublicData.header.username,
        icon: selfNotificationCount ? AppIcons.notificationShow : AppIcons.user,
        onPress: () => clearElevation(),
        testID: `${testIDPrefix}Self-button`,
      });
    }

    setButtons(tempButtons);
  }, [
    becomeUser,
    clearElevation,
    hasModerator,
    hasTwitarrTeam,
    moderatorNotificationCount,
    profilePublicData,
    selfNotificationCount,
    testIDPrefix,
    theme.colors.error,
    twitarrTeamNotificationCount,
  ]);

  if (buttons.length > 0 && forUser) {
    return <SegmentedButtons value={forUser} onValueChange={setForUser} buttons={buttons} />;
  }

  return <></>;
};
