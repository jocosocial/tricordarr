import {CruiseDayTime, ScheduleFilterSettings} from './Types';
import {InfiniteData} from '@tanstack/react-query';
import {EventData, FezData, FezListData, PersonalEventData} from './Structs/ControllerStructs.tsx';
import {EventType} from './Enums/EventType.ts';
import {useCallback} from 'react';
import {calcCruiseDayTime, getTimeZoneOffset} from './DateTime.ts';
import {parseISO} from 'date-fns';

export const buildScheduleList = (
  filterSettings: ScheduleFilterSettings,
  lfgJoinedData?: InfiniteData<FezListData>,
  lfgOpenData?: InfiniteData<FezListData>,
  eventData?: EventData[],
  personalEventData?: PersonalEventData[],
): (FezData | EventData | PersonalEventData)[] => {
  let lfgList: FezData[] = [];
  if (!filterSettings.eventTypeFilter && !filterSettings.eventFavoriteFilter && !filterSettings.eventPersonalFilter) {
    if (filterSettings.showJoinedLfgs && lfgJoinedData) {
      lfgJoinedData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
    }
    if (!filterSettings.eventFavoriteFilter || !filterSettings.eventPersonalFilter) {
      if (filterSettings.showOpenLfgs && lfgOpenData) {
        lfgOpenData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
      }
    }
  }
  let eventList: EventData[] = [];
  if (!(filterSettings.eventPersonalFilter || filterSettings.eventLfgFilter)) {
    eventData?.map(event => {
      if (
        (filterSettings.eventTypeFilter && event.eventType !== EventType[filterSettings.eventTypeFilter]) ||
        (filterSettings.eventFavoriteFilter && !event.isFavorite)
      ) {
        return;
      } else {
        eventList.push(event);
      }
    });
  }
  let personalEventList: PersonalEventData[] = [];
  if (!(filterSettings.eventTypeFilter || filterSettings.eventFavoriteFilter || filterSettings.eventLfgFilter)) {
    personalEventList = personalEventData || [];
  }

  // The order of the combinedList is important. In the event of a tie for start time, personalEvents should
  // be listed first, followed by Events then LFGs. It's possible that LFGs should be second in the priority.
  // Will see if any cases come up where that matters.
  return [personalEventList, eventList, lfgList].flat().sort((a, b) => {
    if (a.startTime && b.startTime) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
    // Return 0 if both startTime are undefined (order remains unchanged)
    return 0;
  });
};

export const getScheduleScrollIndex = (
  nowDayTime: CruiseDayTime,
  itemList: (EventData | FezData | PersonalEventData)[],
  cruiseStartDate: Date,
  cruiseEndDate: Date,
  portTimeZoneID: string,
) => {
  for (let i = 0; i < itemList.length; i++) {
    // Creating a dedicated variable makes the parser happier.
    const scheduleItem = itemList[i];
    if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
      break;
    }
    const itemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), cruiseStartDate, cruiseEndDate);
    const tzOffset = getTimeZoneOffset(portTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);

    if (
      nowDayTime.cruiseDay === itemStartDayTime.cruiseDay &&
      nowDayTime.dayMinutes - tzOffset <= itemStartDayTime.dayMinutes
    ) {
      return i - 1;
    }
  }
  // If we have ScheduleItems but Now is beyond the last one of the day, simply set the index to the last possible item.
  if (itemList.length > 0) {
    // Creating a dedicated variable makes the parser happier.
    const scheduleItem = itemList[itemList.length - 1];
    if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
      return itemList.length - 1;
    }
    const lastItemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), cruiseStartDate, cruiseEndDate);
    const lastItemTzOffset = getTimeZoneOffset(portTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);
    if (
      nowDayTime.cruiseDay === lastItemStartDayTime.cruiseDay &&
      nowDayTime.dayMinutes - lastItemTzOffset >= lastItemStartDayTime.dayMinutes
    ) {
      return itemList.length - 1;
    }
  }
  // List of zero or any other situation, just return 0 (start of list);
  return 0;
};
