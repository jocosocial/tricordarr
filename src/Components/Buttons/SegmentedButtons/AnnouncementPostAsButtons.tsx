import {useField} from 'formik';
import React, {useMemo} from 'react';
import {SegmentedButtons, Text} from 'react-native-paper';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts, UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {SegmentedButtonType} from '#src/Types';

interface AnnouncementPostAsButtonsProps {
  name: string;
  testIDPrefix?: string;
  label?: string;
}

/**
 * Self / TwitarrTeam / THO / admin picker for authoring an Announcement. Unlike the
 * Moderator/TwitarrTeam elevation used elsewhere, Announcements use an exact-accessLevel
 * matrix (a THO caller may not post as TwitarrTeam, and vice versa) rather than the
 * hierarchical `usePrivilege()` checks, and moderator is never a valid announcement author.
 * "admin" is omitted when the caller already is admin, since it would be redundant with self.
 */
export const AnnouncementPostAsButtons = ({
  name,
  testIDPrefix = 'announcementPostAs',
  label,
}: AnnouncementPostAsButtonsProps) => {
  const [field, , helpers] = useField<string>(name);
  const {currentSession} = useSession();
  const {data: profilePublicData} = useUserProfileQuery();
  const {commonStyles} = useStyles();
  const accessLevel = currentSession?.tokenData?.accessLevel;

  const buttons = useMemo(() => {
    const privileged: SegmentedButtonType[] = [];
    if (accessLevel === UserAccessLevel.twitarrteam || accessLevel === UserAccessLevel.admin) {
      privileged.push({
        value: PrivilegedUserAccounts.TwitarrTeam,
        label: 'TwitarrTeam',
        icon: AppIcons.twitarrteam,
        testID: `${testIDPrefix}TwitarrTeam-button`,
      });
    }
    if (accessLevel === UserAccessLevel.tho || accessLevel === UserAccessLevel.admin) {
      privileged.push({
        value: PrivilegedUserAccounts.THO,
        label: 'THO',
        icon: AppIcons.tho,
        testID: `${testIDPrefix}THO-button`,
      });
    }
    if (accessLevel === UserAccessLevel.twitarrteam || accessLevel === UserAccessLevel.tho) {
      privileged.push({
        value: PrivilegedUserAccounts.admin,
        label: 'Admin',
        icon: AppIcons.admin,
        testID: `${testIDPrefix}Admin-button`,
      });
    }
    if (privileged.length === 0 || !profilePublicData) {
      return [];
    }
    return [
      {
        value: 'self',
        label: profilePublicData.header.username,
        icon: AppIcons.user,
        testID: `${testIDPrefix}Self-button`,
      },
      ...privileged,
    ];
  }, [accessLevel, profilePublicData, testIDPrefix]);

  if (buttons.length === 0) {
    return null;
  }

  return (
    <>
      {label && <Text style={commonStyles.marginBottomSmall}>{label}</Text>}
      <SegmentedButtons value={field.value} onValueChange={helpers.setValue} buttons={buttons} />
    </>
  );
};
