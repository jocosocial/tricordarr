import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, EventStackComponents} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {CruiseDayTime, ScheduleFilterSettings} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {ScheduleEventFilterMenu} from '../../Menus/ScheduleEventFilterMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ScheduleListActions} from '../../Reducers/Schedule/ScheduleListReducer';
import {EventFAB} from '../../Buttons/FloatingActionButtons/EventFAB';
import {ScheduleDayHeaderView} from '../../Views/Schedule/ScheduleDayHeaderView';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {EventActionsMenu} from '../../Menus/EventActionsMenu';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventDayScreen,
  NavigatorIDs.eventStack
>;

export const EventDayScreen = ({navigation, route}: Props) => {
  const {eventTypeFilter, eventFavoriteFilter} = useFilter();
  const {isLoggedIn} = useAuth();
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
      enabled: isLoggedIn,
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
      enabled: isLoggedIn,
    },
  });

  const {commonStyles} = useStyles();
  const {startDate, endDate} = useCruise();
  const listRef = useRef<FlatList<EventData | FezData>>(null);
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const [refreshing, setRefreshing] = useState(false);
  const {scheduleList, dispatchScheduleList} = useTwitarr();
  const {appConfig} = useConfig();

  const getScrollIndex = useCallback(
    (nowDayTime: CruiseDayTime, itemList: (EventData | FezData)[]) => {
      for (let i = 0; i < itemList.length; i++) {
        // Creating a dedicated variable makes the parser happier.
        const scheduleItem = itemList[i];
        if (!scheduleItem.startTime || !scheduleItem.timeZone) {
          break;
        }
        const itemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const tzOffset = getTimeZoneOffset(appConfig.portTimeZoneID, scheduleItem.timeZone, scheduleItem.startTime);

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
        if (!scheduleItem.startTime || !scheduleItem.timeZone) {
          return itemList.length - 1;
        }
        const lastItemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const lastItemTzOffset = getTimeZoneOffset(
          appConfig.portTimeZoneID,
          scheduleItem.timeZone,
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
      console.warn('ListRef is undefined or no items, not scrolling.');
      return;
    }
    console.log(
      'Scrolling to index',
      scrollNowIndex,
      'length',
      scheduleList.length,
      scheduleList[scrollNowIndex]?.title,
      'at',
      scheduleList[scrollNowIndex]?.startTime,
    );
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

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleCruiseDayMenu scrollToNow={scrollToNow} route={route} />
          <ScheduleEventFilterMenu />
          <EventActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, route, scrollToNow]);

  const buildScheduleList = useCallback(
    (filterSettings: ScheduleFilterSettings) => {
      let lfgList: FezData[] = [];
      if (!filterSettings.eventTypeFilter) {
        if (filterSettings.showLfgs && lfgJoinedData) {
          lfgJoinedData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
        }
        if (!filterSettings.eventFavoriteFilter) {
          if (filterSettings.showLfgs && lfgOpenData) {
            lfgOpenData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
          }
        }
      }
      let eventList: EventData[] = [];
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
      console.log('Dispatching', eventData?.length, 'events', lfgList.length, 'LFGs');
      dispatchScheduleList({
        type: ScheduleListActions.setList,
        eventList: eventList,
        fezList: lfgList,
      });
    },
    [dispatchScheduleList, eventData, lfgJoinedData, lfgOpenData],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchEvents().then(() => {
      refetchLfgJoined().then(() => {
        refetchLfgOpen().then(() => {
          setRefreshing(false);
        });
      });
    });
  }, [refetchEvents, refetchLfgJoined, refetchLfgOpen]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    console.log('ScheduleDayScreen::useEffect::dispatchScheduleList');
    const filterSettings: ScheduleFilterSettings = {
      eventTypeFilter: eventTypeFilter ? (eventTypeFilter as keyof typeof EventType) : undefined,
      eventFavoriteFilter: eventFavoriteFilter,
      showLfgs: appConfig.unifiedSchedule,
    };
    buildScheduleList(filterSettings);
  }, [
    appConfig.unifiedSchedule,
    buildScheduleList,
    dispatchScheduleList,
    eventData,
    eventFavoriteFilter,
    eventTypeFilter,
    lfgJoinedData,
    lfgOpenData,
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

  console.log('Item count', scheduleList.length, 'Now index', scrollNowIndex);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLfgJoinedLoading || isLfgOpenLoading || isEventLoading) {
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
            scrollNowIndex={scrollNowIndex}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            setRefreshing={setRefreshing}
          />
        </View>
      </View>
      <EventFAB />
    </AppView>
  );
};
