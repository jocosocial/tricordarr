import {CruiseDayTime, ScheduleCardMarkerType, ScheduleFilterSettings} from './Types';
import {InfiniteData} from '@tanstack/react-query';
import {EventData, FezData, FezListData, PersonalEventData} from './Structs/ControllerStructs.tsx';
import {EventType} from './Enums/EventType.ts';
import {calcCruiseDayTime, getTimeZoneOffset} from './DateTime.ts';
import {parseISO} from 'date-fns';

/**
 * Assemble an array containing all items to display in a schedule list.
 * This array should be ordered by start time.
 * @param filterSettings
 * @param lfgJoinedData
 * @param lfgOpenData
 * @param eventData
 * @param personalEventData
 */
export const buildScheduleList = (
  filterSettings: ScheduleFilterSettings,
  lfgJoinedData?: InfiniteData<FezListData>,
  lfgOpenData?: InfiniteData<FezListData>,
  eventData?: EventData[],
  personalEventData?: PersonalEventData[],
): (FezData | EventData | PersonalEventData)[] => {
  let anyPersonalFilter =
    filterSettings.eventLfgFilter || filterSettings.eventFavoriteFilter || filterSettings.eventPersonalFilter;

  let lfgList: FezData[] = [];
  if (filterSettings.eventLfgFilter || !anyPersonalFilter) {
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
  if (filterSettings.eventFavoriteFilter || !anyPersonalFilter) {
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
  if (filterSettings.eventPersonalFilter || !anyPersonalFilter) {
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

    if (nowDayTime.dayMinutes - tzOffset <= itemStartDayTime.dayMinutes) {
      // The current i index is the next event in the schedule. Put another way,
      // it's the first upcoming event.

      // We now want to go back in time and find the start of the next chunk of the schedule.
      // So we recurse backwards until we find an element that doesn't share the same
      // Separator ID as the first element before the current element. Confused? Yeah me too.
      let previousMarkerID: string | undefined;
      for (let r = 1; r < itemList.length - i; r++) {
        const previousItem = itemList[i - r];
        if (!previousItem || !previousItem.startTime || !previousItem.timeZoneID) {
          break;
        }
        let separatorID = getScheduleListTimeSeparatorID(new Date(previousItem.startTime));
        if (!previousMarkerID) {
          previousMarkerID = separatorID;
        } else {
          if (separatorID !== previousMarkerID) {
            // This is +1 because we've already advanced the loop to the next item
            // but we wanted the previous one.
            return i - r + 1;
          }
        }
      }
      // When in doubt, do current - 1.
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

export const getScheduleItemMarker = (
  item: EventData | FezData | PersonalEventData,
  portTimeZoneID: string,
  nowDate: Date,
  startDate: Date,
  endDate: Date,
): ScheduleCardMarkerType => {
  if (!item.startTime || !item.endTime || !item.timeZoneID) {
    return;
  }
  const itemStartTime = parseISO(item.startTime);
  const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(nowDate, startDate, endDate);
  const tzOffset = getTimeZoneOffset(portTimeZoneID, item.timeZoneID, item.startTime);
  if (
    nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
    nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes &&
    nowDayTime.dayMinutes - tzOffset < eventEndDayTime.dayMinutes
  ) {
    return 'now';
  } else if (
    nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
    nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes - 30 &&
    nowDayTime.dayMinutes - tzOffset < eventStartDayTime.dayMinutes
  ) {
    return 'soon';
  }
};

export const getScheduleListTimeSeparatorID = (date: Date) => `${date.getHours()}:${date.getMinutes()}`;
