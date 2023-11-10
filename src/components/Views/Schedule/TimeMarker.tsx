import {useCruise} from '../../Context/Contexts/CruiseContext';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {parseISO} from 'date-fns';
import {EventCardNowView} from './EventCardNowView';
import {EventCardSoonView} from './EventCardSoonView';
import React from 'react';

interface TimeMarkerProps {
  startTime: string;
  endTime: string;
  timeZone: string;
}

export const TimeMarker = ({startTime, endTime, timeZone}: TimeMarkerProps) => {
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');
  const {appConfig} = useConfig();

  const itemStartTime = parseISO(startTime);
  const itemEndTime = parseISO(endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
  const tzOffset = getTimeZoneOffset(appConfig.portTimeZoneID, timeZone, startTime);

  return (
    <>
      {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
        nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes &&
        nowDayTime.dayMinutes - tzOffset < eventEndDayTime.dayMinutes && <EventCardNowView />}
      {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
        nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes - 30 &&
        nowDayTime.dayMinutes - tzOffset < eventStartDayTime.dayMinutes && <EventCardSoonView />}
    </>
  );
};
