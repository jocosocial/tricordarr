import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/Events/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {CruiseDayTime, ScheduleFilterSettings} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {ScheduleEventFilterMenu} from '../../Menus/Events/ScheduleEventFilterMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {EventFAB} from '../../Buttons/FloatingActionButtons/EventFAB';
import {ScheduleDayHeaderView} from '../../Views/Schedule/ScheduleDayHeaderView';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {EventDayScreenActionsMenu} from '../../Menus/Events/EventDayScreenActionsMenu';
import {usePersonalEventsQuery} from '../../Queries/PersonalEvent/PersonalEventQueries.tsx';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventDayScreen,
  NavigatorIDs.eventStack
>;

export const EventDayScreen = ({navigation, route}: Props) => {
  const {eventTypeFilter, eventFavoriteFilter, eventPersonalFilter, eventLfgFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();
  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: route.params.cruiseDay,
    options: {
      enabled: isLoggedIn,
    },
  });
  const {
    data: lfgOpenData,
    isLoading: isLfgOpenLoading,
    refetch: refetchLfgOpen,
  } = useLfgListQuery({
    cruiseDay: route.params.cruiseDay - 1,
    endpoint: 'open',
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowOpenLfgs,
    },
  });
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: route.params.cruiseDay - 1,
    endpoint: 'joined',
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowJoinedLfgs,
    },
  });
  const {
    data: personalEventData,
    isLoading: isPersonalEventLoading,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: route.params.cruiseDay - 1,
    options: {
      enabled: isLoggedIn,
    },
  });

  const {commonStyles} = useStyles();
  const {startDate, endDate} = useCruise();
  const listRef = useRef<FlatList<EventData | FezData | PersonalEventData>>(null);
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData | PersonalEventData)[]>([]);

  const getScrollIndex = useCallback(
    (nowDayTime: CruiseDayTime, itemList: (EventData | FezData | PersonalEventData)[]) => {
      for (let i = 0; i < itemList.length; i++) {
        // Creating a dedicated variable makes the parser happier.
        const scheduleItem = itemList[i];
        if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
          break;
        }
        const itemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const tzOffset = getTimeZoneOffset(appConfig.portTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);

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
        const lastItemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const lastItemTzOffset = getTimeZoneOffset(
          appConfig.portTimeZoneID,
          scheduleItem.timeZoneID,
          scheduleItem.startTime,
        );
        if (
          nowDayTime.cruiseDay === lastItemStartDayTime.cruiseDay &&
          nowDayTime.dayMinutes - lastItemTzOffset >= lastItemStartDayTime.dayMinutes
        ) {
          return itemList.length - 1;
        }
      }
      // List of zero or any other situation, just return 0 (start of list);
      return 0;
    },
    [appConfig.portTimeZoneID, endDate, startDate],
  );

  const scrollToNow = useCallback(() => {
    if (scheduleList.length === 0 || !listRef.current) {
      return;
    }
    if (scrollNowIndex === 0) {
      listRef.current.scrollToOffset({offset: 0});
    } else if (scrollNowIndex === scheduleList.length - 1) {
      listRef.current.scrollToEnd();
    } else {
      listRef.current.scrollToIndex({
        index: scrollNowIndex,
      });
    }
  }, [scheduleList, scrollNowIndex]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchEvents(), refetchLfgJoined(), refetchLfgOpen(), refetchPersonalEvents()]);
    setRefreshing(false);
  }, [refetchEvents, refetchLfgJoined, refetchLfgOpen, refetchPersonalEvents]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleCruiseDayMenu scrollToNow={scrollToNow} route={route} screen={EventStackComponents.eventDayScreen} />
          <ScheduleEventFilterMenu />
          <EventDayScreenActionsMenu onRefresh={onRefresh} />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, route, scrollToNow, onRefresh]);

  const buildScheduleList = useCallback(
    (filterSettings: ScheduleFilterSettings) => {
      let lfgList: FezData[] = [];
      if (
        !filterSettings.eventTypeFilter &&
        !filterSettings.eventFavoriteFilter &&
        !filterSettings.eventPersonalFilter
      ) {
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
      const combinedList = [personalEventList, eventList, lfgList].flat().sort((a, b) => {
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        // Return 0 if both startTime are undefined (order remains unchanged)
        return 0;
      });
      setScheduleList(combinedList);
    },
    [setScheduleList, eventData, lfgJoinedData, lfgOpenData, personalEventData],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    console.log('[EventDayScreen.tsx] Starting buildScheduleList useEffect.');
    const filterSettings: ScheduleFilterSettings = {
      eventTypeFilter: eventTypeFilter ? (eventTypeFilter as keyof typeof EventType) : undefined,
      eventFavoriteFilter: eventFavoriteFilter,
      showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
      showOpenLfgs: appConfig.schedule.eventsShowOpenLfgs,
      eventPersonalFilter: eventPersonalFilter,
      eventLfgFilter: eventLfgFilter,
    };
    buildScheduleList(filterSettings);
  }, [
    appConfig.schedule.eventsShowJoinedLfgs,
    appConfig.schedule.eventsShowOpenLfgs,
    buildScheduleList,
    eventFavoriteFilter,
    eventPersonalFilter,
    eventTypeFilter,
    eventLfgFilter,
  ]);

  useEffect(() => {
    const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
    setScrollNowIndex(getScrollIndex(nowDayTime, scheduleList));
  }, [endDate, getScrollIndex, minutelyUpdatingDate, scheduleList, startDate]);

  // Trying .navigate() to avoid some performance issues with keeping past pages around.
  const navigatePreviousDay = () =>
    navigation.navigate(EventStackComponents.eventDayScreen, {
      cruiseDay: route.params.cruiseDay - 1,
    });
  const navigateNextDay = () =>
    navigation.navigate(EventStackComponents.eventDayScreen, {
      cruiseDay: route.params.cruiseDay + 1,
    });

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (
    (appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedLoading) ||
    (appConfig.schedule.eventsShowOpenLfgs && isLfgOpenLoading) ||
    isEventLoading ||
    isPersonalEventLoading
  ) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <View style={commonStyles.flex}>
        <ScheduleDayHeaderView
          navigateNextDay={navigateNextDay}
          navigatePreviousDay={navigatePreviousDay}
          selectedCruiseDay={route.params.cruiseDay}
        />
        <View style={commonStyles.flex}>
          <EventFlatList
            listRef={listRef}
            scheduleItems={scheduleList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
            setRefreshing={setRefreshing}
          />
        </View>
      </View>
      <EventFAB cruiseDay={route.params.cruiseDay} />
    </AppView>
  );
};
