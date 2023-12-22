import {useUserNotificationData} from '../Context/Contexts/UserNotificationDataContext';
import {PaddedContentView} from './Content/PaddedContentView';
import {NextEventCard} from '../Cards/MainScreen/NextEventCard';
import React from 'react';

export const MainNextEventView = () => {
  const {userNotificationData} = useUserNotificationData();

  if (!userNotificationData?.nextFollowedEventID) {
    return <></>;
  }

  return (
    <PaddedContentView>
      <NextEventCard eventID={userNotificationData.nextFollowedEventID} />
    </PaddedContentView>
  );
};
