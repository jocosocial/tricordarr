import {PaddedContentView} from './Content/PaddedContentView';
import {NextEventCard} from '../Cards/MainScreen/NextEventCard';
import React from 'react';
import {useUserNotificationDataQuery} from '../Queries/Alert/NotificationQueries';

export const MainNextEventView = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery();

  if (!userNotificationData?.nextFollowedEventID) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <NextEventCard eventID={userNotificationData.nextFollowedEventID} />
    </PaddedContentView>
  );
};
