import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {FlatList} from 'react-native-gesture-handler';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, EventStackComponents} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {IconButton, Menu, Text} from 'react-native-paper';
import {format, parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {LfgFAB} from '../../Buttons/FloatingActionButtons/LfgFAB';
import {CruiseDayTime, ScheduleFilterSettings} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {ScheduleEventFilterMenu} from '../../Menus/ScheduleEventFilterMenu';
import {useScheduleFilter} from '../../Context/Contexts/ScheduleFilterContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {ScheduleMenu} from '../../Menus/ScheduleMenu';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ScheduleListActions} from '../../Reducers/Schedule/ScheduleListReducer';
import {EventFAB} from '../../Buttons/FloatingActionButtons/EventFAB';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.scheduleDayScreen,
  NavigatorIDs.eventStack
>;

export const EventDayScreen = ({navigation, route}: Props) => {
  const {eventTypeFilter, eventFavoriteFilter} = useScheduleFilter();
  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({cruiseDay: route.params.cruiseDay});
  const {
    data: lfgOpenData,
    isLoading: isLfgOpenLoading,
    refetch: refetchLfgOpen,
  } = useLfgListQuery({cruiseDay: route.params.cruiseDay - 1, endpoint: 'open'});
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({cruiseDay: route.params.cruiseDay - 1, endpoint: 'joined'});

  const {commonStyles} = useStyles();
  const {cruiseDays, cruiseDayToday, cruiseLength, startDate, endDate} = useCruise();
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
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleEventFilterMenu />
          <ScheduleCruiseDayMenu scrollToNow={scrollToNow} route={route} />
        </HeaderButtons>
      </View>
    );
  }, [route, scrollToNow]);

  const buildScheduleList = useCallback(
    (filterSettings: ScheduleFilterSettings) => {
      let lfgList: FezData[] = [];
      if (!filterSettings.eventTypeFilter) {
        if (filterSettings.showLfgs && lfgJoinedData) {
          lfgJoinedData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
        }
        if (filterSettings.showLfgs && lfgOpenData) {
          lfgOpenData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
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

  const styles = StyleSheet.create({
    headerText: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.bold,
    },
    headerTextContainer: {
      ...commonStyles.flexGrow,
      ...commonStyles.justifyCenter,
    },
    headerView: {
      ...commonStyles.flexRow,
    },
  });

  const navigatePreviousDay = () =>
    navigation.push(EventStackComponents.scheduleDayScreen, {
      cruiseDay: route.params.cruiseDay - 1,
    });
  const navigateNextDay = () =>
    navigation.push(EventStackComponents.scheduleDayScreen, {
      cruiseDay: route.params.cruiseDay + 1,
    });

  console.log('Item count', scheduleList.length, 'Now index', scrollNowIndex);

  if (isLfgJoinedLoading || isLfgOpenLoading || isEventLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <View style={commonStyles.flex}>
        <View style={{...styles.headerView}}>
          <IconButton icon={AppIcons.back} onPress={navigatePreviousDay} disabled={route.params.cruiseDay === 1} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              {format(cruiseDays[route.params.cruiseDay - 1].date, 'eeee LLLL do')}
              {cruiseDayToday === route.params.cruiseDay ? ' (Today)' : ''}
            </Text>
          </View>
          <IconButton
            icon={AppIcons.forward}
            onPress={navigateNextDay}
            disabled={route.params.cruiseDay === cruiseLength}
          />
        </View>
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
