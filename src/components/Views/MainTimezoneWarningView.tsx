import React from 'react';
import {TimezoneWarningCard} from '../Cards/MainScreen/TimezoneWarningCard.tsx';
import {PaddedContentView} from './Content/PaddedContentView.tsx';
import {useUserNotificationDataQuery} from '../Queries/Alert/NotificationQueries.ts';

export const MainTimezoneWarningView = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery();
  // .getTimezoneOffset() reports in minutes and from the opposite perspective
  // as the server. Server says "you're -4" whereas device says "they're +4".
  const deviceTimeOffset = new Date().getTimezoneOffset() * -60;

  if (!userNotificationData || deviceTimeOffset === userNotificationData.serverTimeOffset) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <TimezoneWarningCard />
    </PaddedContentView>
  );
};
