import {PaddedContentView} from './Content/PaddedContentView';
import {NextEventCard} from '../Cards/MainScreen/NextEventCard';
import React from 'react';
import {useUserNotificationDataQuery} from '../Queries/Alert/NotificationQueries';
import {NextLFGCard} from '../Cards/MainScreen/NextLFGCard';

export const MainNextEventView = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery();

  if (!userNotificationData?.nextJoinedLFGID) {
    return <></>;
  }

  return (
    <>
      {userNotificationData.nextFollowedEventID && (
        <PaddedContentView>
          <NextEventCard eventID={userNotificationData.nextFollowedEventID} />
        </PaddedContentView>
      )}
      {userNotificationData.nextFollowedEventID && (
        <PaddedContentView>
          <NextLFGCard lfgID={userNotificationData.nextJoinedLFGID} />
        </PaddedContentView>
      )}
    </>
  );
};
