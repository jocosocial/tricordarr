import {InfiniteData} from '@tanstack/react-query';
import {parseISO} from 'date-fns';
import ical, {VEvent} from 'node-ical';

import {EventType} from '#src/Enums/EventType';
import {calcCruiseDayTime, getTimeZoneOffset} from '#src/Libraries/DateTime';
import {EventData, FezData, FezListData} from '#src/Structs/ControllerStructs';
import {CruiseDayTime, ScheduleCardMarkerType, ScheduleFilterSettings} from '#src/Types';

/**
 * Assemble an array containing all items to display in a schedule list.
 * This array should be ordered by start time.
 * @param filterSettings
 * @param lfgJoinedData
 * @param lfgOwnedData
 * @param lfgOpenData
 * @param eventData
 * @param personalEventData
 */
export const buildScheduleList = (
  filterSettings: ScheduleFilterSettings,
  lfgJoinedData?: InfiniteData<FezListData>,
  lfgOwnedData?: InfiniteData<FezListData>,
  lfgOpenData?: InfiniteData<FezListData>,
  eventData?: EventData[],
  personalEventData?: InfiniteData<FezListData>,
): (FezData | EventData)[] => {
  const anyFilter = !!(
    filterSettings.eventTypeFilter ||
    filterSettings.eventFavoriteFilter ||
    filterSettings.eventPersonalFilter ||
    filterSettings.eventPersonalUnreadFilter ||
    filterSettings.eventLfgJoinedFilter ||
    filterSettings.eventLfgOwnedFilter ||
    filterSettings.eventLfgOpenFilter ||
    filterSettings.eventShutternautFilter
  );

  let lfgList: FezData[] = [];
  let eventList: EventData[] = [];
  let personalEventList: FezData[] = [];

  if (!anyFilter) {
    // Default: all events, default LFGs per config, all personal events
    if (filterSettings.showJoinedLfgs && lfgJoinedData) {
      lfgJoinedData.pages.forEach(page => (lfgList = lfgList.concat(page.fezzes)));
    }
    if (filterSettings.showOpenLfgs && lfgOpenData) {
      lfgOpenData.pages.forEach(page => (lfgList = lfgList.concat(page.fezzes)));
    }
    eventData?.forEach(event => eventList.push(event));
    if (personalEventData?.pages) {
      personalEventData.pages.forEach(page => (personalEventList = personalEventList.concat(page.fezzes)));
    }
  } else {
    // Restrictive: show only items matching at least one active filter (OR across filter types)
    if (filterSettings.eventLfgJoinedFilter && filterSettings.showJoinedLfgs && lfgJoinedData) {
      lfgJoinedData.pages.forEach(page => (lfgList = lfgList.concat(page.fezzes)));
    }
    if (filterSettings.eventLfgOwnedFilter && lfgOwnedData) {
      lfgOwnedData.pages.forEach(page => (lfgList = lfgList.concat(page.fezzes)));
    }
    if (filterSettings.eventLfgOpenFilter && filterSettings.showOpenLfgs && lfgOpenData) {
      lfgOpenData.pages.forEach(page => (lfgList = lfgList.concat(page.fezzes)));
    }

    const eventFilterOn =
      !!filterSettings.eventTypeFilter ||
      !!filterSettings.eventFavoriteFilter ||
      !!filterSettings.eventShutternautFilter;
    if (eventFilterOn && eventData) {
      eventData.forEach(event => {
        const matchesType = filterSettings.eventTypeFilter
          ? event.eventType === EventType[filterSettings.eventTypeFilter]
          : false;
        const matchesFavorite = filterSettings.eventFavoriteFilter ? event.isFavorite : false;
        let matchesShutternaut = false;
        if (filterSettings.eventShutternautFilter && event.shutternautData) {
          const sf = filterSettings.eventShutternautFilter;
          switch (sf) {
            case 'needsPhotographer':
              matchesShutternaut =
                event.shutternautData.needsPhotographer === true && event.shutternautData.photographers.length === 0;
              break;
            case 'hasphotographer':
              matchesShutternaut = event.shutternautData.photographers.length > 0;
              break;
            case 'nophotographer':
              matchesShutternaut = event.shutternautData.photographers.length === 0;
              break;
            case 'imphotographer':
              matchesShutternaut = event.shutternautData.userIsPhotographer === true;
              break;
          }
        }
        if (matchesType || matchesFavorite || matchesShutternaut) {
          eventList.push(event);
        }
      });
    }

    // Shutternaut + personal: only show personal events if a personal filter is also active
    const personalFilterOn = !!filterSettings.eventPersonalFilter || !!filterSettings.eventPersonalUnreadFilter;
    if (!filterSettings.eventShutternautFilter || personalFilterOn) {
      if (personalFilterOn && personalEventData?.pages) {
        personalEventData.pages.forEach(page => (personalEventList = personalEventList.concat(page.fezzes)));
      }
    }
  }

  // The order of the combinedList is important. In the event of a tie for start time, personalEvents should
  // be listed first, followed by Events then LFGs. It's possible that LFGs should be second in the priority.
  // Will see if any cases come up where that matters.
  const combinedList = [personalEventList, eventList, lfgList].flat();

  // Deduplicate items by their unique IDs
  const seenIds = new Set<string>();
  const deduplicatedList: (FezData | EventData)[] = [];
  for (const item of combinedList) {
    const id = 'fezID' in item ? item.fezID : item.eventID;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      deduplicatedList.push(item);
    }
  }

  return deduplicatedList.sort((a, b) => {
    if (a.startTime && b.startTime) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
    // Return 0 if both startTime are undefined (order remains unchanged)
    return 0;
  });
};

/**
 * Determine the index of the item in a list of schedule objects should be considered
 * the one where "now" is. This enables the user to jump (roughly) to that point in
 * the list.
 * @param nowDayTime CruiseDayTime of the current day and minutes into the day that we are.
 * @param itemList List of items
 * @param cruiseStartDate Start Date of the cruise
 * @param cruiseEndDate End Date of the cruise
 * @param referenceTimeZoneID Time Zone ID to use for "now" (typically the boat timezone at current time).
 */
export const getScheduleScrollIndex = (
  nowDayTime: CruiseDayTime,
  itemList: (EventData | FezData)[],
  cruiseStartDate: Date,
  cruiseEndDate: Date,
  referenceTimeZoneID: string,
) => {
  for (let i = 0; i < itemList.length; i++) {
    // Creating a dedicated variable makes the parser happier.
    const scheduleItem = itemList[i];
    if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
      break;
    }
    const itemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), cruiseStartDate, cruiseEndDate);
    const tzOffset = getTimeZoneOffset(referenceTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);
    // ScheduleItems that are present in the early hours of the day (00:00-03:00)
    // mess with the detection since their dayMinutes are large (coming from the previous day).
    // Skip these for consideration of the now index.
    if (nowDayTime.cruiseDay !== itemStartDayTime.cruiseDay) {
      continue;
    }
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
            // This is +1 because we've already advanced the loop to the next item,
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
    // I have no idea why all of this was here if it was so "simple".
    // Commenting out until I can test it more.
    // // Creating a dedicated variable makes the parser happier.
    // const scheduleItem = itemList[itemList.length - 1];
    // if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
    //   return itemList.length - 1;
    // }
    // const lastItemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), cruiseStartDate, cruiseEndDate);
    // const lastItemTzOffset = getTimeZoneOffset(referenceTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);
    // if (
    //   nowDayTime.cruiseDay === lastItemStartDayTime.cruiseDay &&
    //   nowDayTime.dayMinutes - lastItemTzOffset >= lastItemStartDayTime.dayMinutes
    // ) {
    //   return itemList.length - 1;
    // }
    return itemList.length - 1;
  }
  // List of zero or any other situation, just return 0 (start of list);
  return 0;
};

/**
 * Determines if a schedule item should display a "now" or "soon" marker.
 * @param item The schedule item (event or LFG)
 * @param tzOffset Offset from the boat timezone at "now" to the item's timezone (in minutes)
 * @param nowDate Current date/time
 * @param startDate Start Date() of the cruise, typically midnight in the port TZ.
 * @param endDate End Date() of the cruise, typically midnight in the port TZ.
 */
export const getScheduleItemMarker = (
  item: EventData | FezData,
  tzOffset: number,
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

/**
 * Returns a string identifier of a schedule item. Convention is this is "HH:MM" which indicates
 * a block of time that we care about for things like rendering separators or determining when
 * "now" is and if this is block we are in.
 * @param date Date object to generate the ID for.
 */
export const getScheduleListTimeSeparatorID = (date: Date) => `${date.getHours()}:${date.getMinutes()}`;

export const getCalFeedFromUrl = async (feedUrl: string) => {
  const icalResponse = await ical.async.fromURL(feedUrl);
  const events: VEvent[] = [];
  for (const event of Object.values(icalResponse)) {
    if (event.type === 'VEVENT') {
      events.push(event);
    }
  }
  return events;
};

export const getEventUid = (eventUid: string) => {
  if (eventUid.includes('@')) {
    return eventUid.split('@')[0];
  }
  return eventUid;
};
