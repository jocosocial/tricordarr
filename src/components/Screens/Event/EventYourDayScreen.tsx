import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {CruiseDayTime, ScheduleFilterSettings} from '../../../libraries/Types';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {ScheduleDayHeaderView} from '../../Views/Schedule/ScheduleDayHeaderView';
import {ScheduleCruiseDayMenu} from '../../Menus/Events/ScheduleCruiseDayMenu';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {parseISO} from 'date-fns';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventYourDayScreen,
  NavigatorIDs.eventStack
>;

export const EventYourDayScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: route.params.cruiseDay,
  });
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: route.params.cruiseDay - 1,
    endpoint: 'joined',
    options: {
      enabled: appConfig.schedule.eventsShowJoinedLfgs,
    },
  });

  const {commonStyles} = useStyles();
  const listRef = useRef<FlatList<EventData | FezData>>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData)[]>([]);
  const {isLoggedIn} = useAuth();
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const {startDate, endDate} = useCruise();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchEvents().then(() => {
      refetchLfgJoined().then(() => {
        setRefreshing(false);
      });
    });
  }, [refetchEvents, refetchLfgJoined]);

  const buildScheduleList = useCallback(
    (filterSettings: ScheduleFilterSettings) => {
      let lfgList: FezData[] = [];
      if (filterSettings.showJoinedLfgs && lfgJoinedData) {
        lfgJoinedData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
      }
      let eventList: EventData[] = [];
      eventData?.map(event => {
        if (event.isFavorite) {
          eventList.push(event);
        }
      });
      setScheduleList(eventList);
    },
    [setScheduleList, eventData, lfgJoinedData],
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

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {/*<ScheduleYourCruiseDayMenu route={route} />*/}
          <ScheduleCruiseDayMenu
            scrollToNow={scrollToNow}
            route={route}
            screen={EventStackComponents.eventYourDayScreen}
          />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, route, scrollToNow]);

  const getScrollIndex = useCallback(
    (nowDayTime: CruiseDayTime, itemList: (EventData | FezData)[]) => {
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    const filterSettings: ScheduleFilterSettings = {
      showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
    };
    buildScheduleList(filterSettings);
  }, [appConfig.schedule.eventsShowJoinedLfgs, appConfig.schedule.eventsShowOpenLfgs, buildScheduleList]);

  useEffect(() => {
    const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
    setScrollNowIndex(getScrollIndex(nowDayTime, scheduleList));
  }, [endDate, getScrollIndex, minutelyUpdatingDate, scheduleList, startDate]);

  if ((appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedLoading) || isEventLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <View style={commonStyles.flex}>
        <View style={commonStyles.flex}>
          <ScheduleDayHeaderView selectedCruiseDay={route.params.cruiseDay} hideDayButtons={true} />
          <EventFlatList
            listRef={listRef}
            scheduleItems={scheduleList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            setRefreshing={setRefreshing}
          />
        </View>
      </View>
    </AppView>
  );
};
