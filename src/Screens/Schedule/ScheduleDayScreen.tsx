import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {ScheduleFAB} from '#src/Components/Buttons/FloatingActionButtons/ScheduleFAB';
import {HeaderDayPlannerButton} from '#src/Components/Buttons/HeaderButtons/HeaderDayPlannerButton';
import {HeaderScheduleYourDayButton} from '#src/Components/Buttons/HeaderButtons/HeaderScheduleYourDayButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
import {ScheduleEventFilterMenu} from '#src/Components/Menus/Schedule/ScheduleEventFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import useDateTime, {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {buildScheduleList, getScheduleScrollIndex} from '#src/Libraries/Schedule';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayScreen>;

export const ScheduleDayScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/events'}>
      <ScheduleDayScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const ScheduleDayScreenInner = ({navigation}: Props) => {
  const {adjustedCruiseDayToday, startDate, endDate} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday);
  const {isLoggedIn} = useAuth();
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashListRef<EventData | FezData>>(null);
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
      enabled: isLoggedIn && appConfig.schedule.eventsShowOpenLfgs && oobeCompleted && !appConfig.preRegistrationMode,
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
      enabled: isLoggedIn && appConfig.schedule.eventsShowJoinedLfgs && oobeCompleted && !appConfig.preRegistrationMode,
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
      enabled: isLoggedIn && oobeCompleted && !appConfig.preRegistrationMode,
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
        <MaterialHeaderButtons>
          <Item
            title={'Search'}
            iconName={AppIcons.search}
            onPress={() => navigation.push(CommonStackComponents.eventSearchScreen)}
          />
          {appConfig.enableExperiments ? (
            <HeaderDayPlannerButton cruiseDay={selectedCruiseDay} />
          ) : (
            <HeaderScheduleYourDayButton />
          )}
          <ScheduleEventFilterMenu />

          <ScheduleDayScreenActionsMenu onRefresh={onRefresh} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [isLoggedIn, onRefresh, navigation, selectedCruiseDay, appConfig.enableExperiments]);

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
    <AppView>
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
