import {AppView} from '../../Views/AppView.tsx';
import {ScheduleHeaderView} from '../../Views/Schedule/ScheduleHeaderView.tsx';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleFAB} from '../../Buttons/FloatingActionButtons/ScheduleFAB.tsx';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {ScheduleEventFilterMenu} from '../../Menus/Schedule/ScheduleEventFilterMenu.tsx';
import {ScheduleDayScreenActionsMenu} from '../../Menus/Schedule/ScheduleDayScreenActionsMenu.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {useEventsQuery} from '../../Queries/Events/EventQueries.ts';
import {useLfgListQuery, usePersonalEventsQuery} from '../../Queries/Fez/FezQueries.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {EventData, FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {buildScheduleList, getScheduleScrollIndex} from '../../../Libraries/Schedule.ts';
import useDateTime, {calcCruiseDayTime} from '../../../Libraries/DateTime.ts';
import {FlashList} from '@shopify/flash-list';
import {HeaderScheduleYourDayButton} from '../../Buttons/HeaderButtons/HeaderScheduleYourDayButton.tsx';
import {ScheduleFlatList} from '../../Lists/Schedule/ScheduleFlatList.tsx';
import {TimezoneWarningView} from '../../Views/Warnings/TimezoneWarningView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayScreen>;
export const ScheduleDayScreen = ({navigation, route}: Props) => {
  const {adjustedCruiseDayToday, startDate, endDate} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday);
  const {isLoggedIn} = useAuth();
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashList<EventData | FezData>>(null);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData)[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const {appConfig, oobeCompleted} = useConfig();
  const {scheduleFilterSettings} = useFilter();
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);

  const {
    data: eventData,
    isFetching: isEventFetching,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: selectedCruiseDay,
    options: {
      enabled: isLoggedIn,
    },
  });
  const {
    data: lfgOpenData,
    isFetching: isLfgOpenFetching,
    refetch: refetchLfgOpen,
    hasNextPage: openHasNextPage,
    fetchNextPage: openFetchNextPage,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'open',
    hidePast: false,
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowOpenLfgs && oobeCompleted,
    },
  });
  const {
    data: lfgJoinedData,
    isFetching: isLfgJoinedFetching,
    refetch: refetchLfgJoined,
    hasNextPage: joinedHasNextPage,
    fetchNextPage: joinedFetchNextPage,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'joined',
    hidePast: false,
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowJoinedLfgs && oobeCompleted,
    },
  });
  const {
    data: personalEventData,
    isFetching: isPersonalEventFetching,
    refetch: refetchPersonalEvents,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    options: {
      enabled: isLoggedIn && oobeCompleted,
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (oobeCompleted) {
      await Promise.all([refetchEvents(), refetchLfgJoined(), refetchLfgOpen(), refetchPersonalEvents()]);
    } else {
      await Promise.all([refetchEvents()]);
    }
    setRefreshing(false);
  }, [refetchEvents, refetchLfgJoined, refetchLfgOpen, refetchPersonalEvents, oobeCompleted]);

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
        // The viewOffset is so that we show the TimeSeparator in the view as well.
        viewOffset: 40,
        animated: true,
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
          <HeaderScheduleYourDayButton />
          <ScheduleEventFilterMenu />
          <Item
            title={'Search'}
            iconName={AppIcons.search}
            onPress={() => navigation.push(CommonStackComponents.eventSearchScreen)}
          />
          <ScheduleDayScreenActionsMenu onRefresh={onRefresh} />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, onRefresh, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    console.log('[ScheduleDayScreen.tsx] Starting buildScheduleList useEffect.');
    const listData = buildScheduleList(
      scheduleFilterSettings,
      lfgJoinedData,
      lfgOpenData,
      eventData,
      personalEventData,
    );
    setScheduleList(listData);
    console.log('[ScheduleDayScreen.tsx] Finished buildScheduleList useEffect.');
  }, [scheduleFilterSettings, lfgJoinedData, lfgOpenData, eventData, personalEventData]);

  useEffect(() => {
    if (scheduleList.length > 0) {
      const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
      const index = getScheduleScrollIndex(nowDayTime, scheduleList, startDate, endDate, appConfig.portTimeZoneID);
      setScrollNowIndex(index);
    }
  }, [appConfig.portTimeZoneID, endDate, minutelyUpdatingDate, scheduleList, startDate]);

  useEffect(() => {
    console.log('[ScheduleDayScreen.tsx] Firing pagination useEffect');
    if (openHasNextPage) {
      openFetchNextPage();
    }
    if (joinedHasNextPage) {
      joinedFetchNextPage();
    }
    if (personalHasNextPage) {
      personalFetchNextPage();
    }
  }, [
    joinedFetchNextPage,
    joinedHasNextPage,
    openFetchNextPage,
    openHasNextPage,
    personalFetchNextPage,
    personalHasNextPage,
  ]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  // Returning the <LoadingView /> would lose the position tracking of the <ScheduleHeaderView />
  // list, so we rely on the <RefreshControl /> spinner instead.
  const isRefreshing =
    (appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedFetching) ||
    (appConfig.schedule.eventsShowOpenLfgs && isLfgOpenFetching) ||
    isEventFetching ||
    isPersonalEventFetching ||
    refreshing;

  return (
    <AppView safeEdges={route.params?.oobe ? ['bottom'] : undefined}>
      <TimezoneWarningView />
      <ScheduleHeaderView
        selectedCruiseDay={selectedCruiseDay}
        setCruiseDay={setSelectedCruiseDay}
        scrollToNow={scrollToNow}
      />
      <View style={[commonStyles.flex]}>
        <ScheduleFlatList
          listRef={listRef}
          items={scheduleList}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} enabled={false} />}
          setRefreshing={setRefreshing}
          initialScrollIndex={scrollNowIndex}
          onScrollThreshold={onScrollThreshold}
        />
      </View>
      {oobeCompleted && <ScheduleFAB selectedDay={selectedCruiseDay} showLabel={showFabLabel} />}
    </AppView>
  );
};
