import React from 'react';

import {PrivilegedAccountButtons} from '#src/Components/Buttons/SegmentedButtons/PrivilegedAccountButtons';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Seamail inbox switcher with unread counts for self, Moderator, and TwitarrTeam.
 */
export const SeamailAccountButtons = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery();

  return (
    <PrivilegedAccountButtons
      selfNotificationCount={userNotificationData?.newSeamailMessageCount}
      moderatorNotificationCount={userNotificationData?.moderatorData?.newModeratorSeamailMessageCount}
      twitarrTeamNotificationCount={userNotificationData?.moderatorData?.newTTSeamailMessageCount}
      testIDPrefix={'seamailAccount'}
    />
  );
};
