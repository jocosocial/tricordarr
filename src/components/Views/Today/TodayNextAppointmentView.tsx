import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import {NextEventCard} from '../../Cards/MainScreen/NextEventCard.tsx';
import React from 'react';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';
import {NextLFGCard} from '../../Cards/MainScreen/NextLFGCard.tsx';

export const TodayNextAppointmentView = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery();

  return (
    <>
      {userNotificationData?.nextFollowedEventID && (
        <PaddedContentView>
          <NextEventCard eventID={userNotificationData.nextFollowedEventID} />
        </PaddedContentView>
      )}
      {userNotificationData?.nextJoinedLFGID && (
        <PaddedContentView>
          <NextLFGCard lfgID={userNotificationData.nextJoinedLFGID} />
        </PaddedContentView>
      )}
    </>
  );
};
