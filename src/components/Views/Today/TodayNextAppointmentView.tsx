import {PaddedContentView} from '../Content/PaddedContentView.tsx';
import {NextEventCard} from '../../Cards/MainScreen/NextEventCard.tsx';
import React from 'react';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';
import {NextLFGCard} from '../../Cards/MainScreen/NextLFGCard.tsx';

interface NextEvent {
  startTime: Date;
  id: string;
  type: 'lfg' | 'event';
}

export const TodayNextAppointmentView = () => {
  const {data} = useUserNotificationDataQuery();

  if (!data) {
    return <></>;
  }

  const nextEvent: NextEvent | undefined =
    data.nextFollowedEventTime && data.nextFollowedEventID
      ? {
          startTime: new Date(data.nextFollowedEventTime),
          id: data.nextFollowedEventID,
          type: 'event',
        }
      : undefined;
  // LFG also includes PersonalEvent now.
  const nextLfg: NextEvent | undefined =
    data.nextJoinedLFGTime && data.nextJoinedLFGID
      ? {
          startTime: new Date(data.nextJoinedLFGTime),
          id: data.nextJoinedLFGID,
          type: 'lfg',
        }
      : undefined;

  const getNextAppointment = () => {
    if (nextEvent) {
      if (nextLfg) {
        return [nextEvent, nextLfg].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
      }
      return nextEvent;
    } else if (nextLfg) {
      return nextLfg;
    }
    return;
  };

  const nextAppointment = getNextAppointment();
  console.log(nextAppointment);

  return (
    <>
      {nextAppointment?.type === 'event' && (
        <PaddedContentView>
          <NextEventCard eventID={nextAppointment.id} />
        </PaddedContentView>
      )}
      {nextAppointment?.type === 'lfg' && (
        <PaddedContentView>
          <NextLFGCard lfgID={nextAppointment.id} />
        </PaddedContentView>
      )}
    </>
  );
};
