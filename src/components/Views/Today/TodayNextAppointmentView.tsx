import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import {NextEventCard} from '../../Cards/MainScreen/NextEventCard.tsx';
import React from 'react';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';
import {NextLFGCard} from '../../Cards/MainScreen/NextLFGCard.tsx';

export const TodayNextAppointmentView = () => {
  const {data} = useUserNotificationDataQuery();

  if (!data) {
    return <></>;
  }

  /**
   * Show the next of the two given dates. Or both if they are the same.
   * Deprecating for now.
   */
  // const shouldShow = (a?: string, b?: string): boolean => {
  //   // Make them both dates if they exist, else undefined which is basically false-y.
  //   const aTime = a ? new Date(a) : undefined;
  //   const bTime = b ? new Date(b) : undefined;
  //
  //   // The first date is the one we are looking to show, and we're comparing it against the second.
  //   if (aTime) {
  //     if (bTime) {
  //       return aTime.getTime() <= bTime.getTime();
  //     }
  //     return true;
  //   }
  //   return false;
  // };
  // const showAppointment = () => {
  //   if (!data.nextJoinedLFGTime) {
  //     return false;
  //   }
  //   const lfgBoatTime = calcCruiseDayTime(new Date(data.nextJoinedLFGTime), startDate, endDate);
  //   return lfgBoatTime.cruiseDay === adjustedCruiseDayToday;
  // };

  return (
    <>
      {data.nextFollowedEventID && (
        <PaddedContentView>
          <NextEventCard eventID={data.nextFollowedEventID} />
        </PaddedContentView>
      )}
      {data.nextJoinedLFGID && (
        <PaddedContentView>
          <NextLFGCard lfgID={data.nextJoinedLFGID} />
        </PaddedContentView>
      )}
    </>
  );
};
