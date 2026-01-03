import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFAB} from '#src/Components/Buttons/FloatingActionButtons/ScheduleFAB';
import {HeaderDayPlannerButton} from '#src/Components/Buttons/HeaderButtons/HeaderDayPlannerButton';
import {HeaderScheduleYourDayButton} from '#src/Components/Buttons/HeaderButtons/HeaderScheduleYourDayButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
import {ScheduleEventFilterMenu} from '#src/Components/Menus/Schedule/ScheduleEventFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import useDateTime, {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {buildScheduleList, getScheduleScrollIndex} from '#src/Libraries/Schedule';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayScreen>;

export const ScheduleDayScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/events'}>
        <ScheduleDayScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const ScheduleDayScreenInner = ({navigation}: Props) => {
  const {startDate, endDate} = useCruise();
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashListRef<EventData | FezData>>(null);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData)[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setScheduleList([]), []),
  });
  const {appConfig} = useConfig();
  const {scheduleFilterSettings} = useFilter();
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);

  const {
    data: eventData,
    isFetching: isEventFetching,
    isError: isEventError,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: selectedCruiseDay,
  });
  const {
    data: lfgOpenData,
    isFetching: isLfgOpenFetching,
    isError: isLfgOpenError,
    refetch: refetchLfgOpen,
    hasNextPage: openHasNextPage,
    fetchNextPage: openFetchNextPage,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'open',
    hidePast: false,
    options: {
      enabled: appConfig.schedule.eventsShowOpenLfgs && !appConfig.preRegistrationMode,
    },
  });
  const {
    data: lfgJoinedData,
    isFetching: isLfgJoinedFetching,
    isError: isLfgJoinedError,
    refetch: refetchLfgJoined,
    hasNextPage: joinedHasNextPage,
    fetchNextPage: joinedFetchNextPage,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'joined',
    hidePast: false,
    options: {
      enabled: appConfig.schedule.eventsShowJoinedLfgs && !appConfig.preRegistrationMode,
    },
  });
  const {
    data: lfgOwnedData,
    isFetching: isLfgOwnedFetching,
    isError: isLfgOwnedError,
    refetch: refetchLfgOwned,
    hasNextPage: ownedHasNextPage,
    fetchNextPage: ownedFetchNextPage,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'owner',
    hidePast: false,
    options: {
      enabled: !appConfig.preRegistrationMode,
    },
  });
  const {
    data: personalEventData,
    isFetching: isPersonalEventFetching,
    isError: isPersonalEventError,
    refetch: refetchPersonalEvents,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    // Adding this one line (hidePast: false) does some magic to prevent SchedulePrivateEventsScreen
    // from not refetching private event data even though it is stale. I suspect React Query may be
    // seeing the staleTime from the other instance of the query and thinking that its data is still
    // valid even though it totally isn't. My other guess is that by making it align with the options
    // in SchedulePrivateEventsScreen it somehow fixes this because it makes the queryKeys the same
    // and subject to correct refetching.
    // https://github.com/jocosocial/tricordarr/issues/253
    hidePast: false,
    options: {
      enabled: !appConfig.preRegistrationMode,
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    let refreshes: Promise<any>[] = [refetchEvents()];
    if (!appConfig.preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchLfgOwned(), refetchPersonalEvents());
      if (appConfig.schedule.eventsShowOpenLfgs) {
        refreshes.push(refetchLfgOpen());
      }
    }
    await Promise.all(refreshes);
    setRefreshing(false);
  }, [
    refetchEvents,
    refetchLfgJoined,
    refetchLfgOwned,
    refetchLfgOpen,
    refetchPersonalEvents,
    appConfig.preRegistrationMode,
    appConfig.schedule.eventsShowOpenLfgs,
  ]);

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
  }, [onRefresh, navigation, selectedCruiseDay, appConfig.enableExperiments]);

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
      lfgOwnedData,
      lfgOpenData,
      eventData,
      personalEventData,
    );
    setScheduleList(listData);
    onDataLoaded();
    console.log('[ScheduleDayScreen.tsx] Finished buildScheduleList useEffect.');
  }, [scheduleFilterSettings, lfgJoinedData, lfgOwnedData, lfgOpenData, eventData, personalEventData, onDataLoaded]);

  // Reset switching state on error to prevent stuck loading spinner
  useEffect(() => {
    if (isEventError || isLfgOpenError || isLfgJoinedError || isLfgOwnedError || isPersonalEventError) {
      onQueryError();
    }
  }, [isEventError, isLfgOpenError, isLfgJoinedError, isLfgOwnedError, isPersonalEventError, onQueryError]);

  useEffect(() => {
    if (scheduleList.length > 0) {
      const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
      const index = getScheduleScrollIndex(nowDayTime, scheduleList, startDate, endDate, appConfig.portTimeZoneID);
      setScrollNowIndex(index);
    }
  }, [appConfig.portTimeZoneID, endDate, minutelyUpdatingDate, scheduleList, startDate]);

  useEffect(() => {
    console.log('[ScheduleDayScreen.tsx] Firing pagination useEffect');
    if (appConfig.schedule.eventsShowOpenLfgs && openHasNextPage) {
      openFetchNextPage();
    }
    if (joinedHasNextPage) {
      joinedFetchNextPage();
    }
    if (ownedHasNextPage) {
      ownedFetchNextPage();
    }
    if (personalHasNextPage) {
      personalFetchNextPage();
    }
  }, [
    appConfig.schedule.eventsShowOpenLfgs,
    joinedFetchNextPage,
    joinedHasNextPage,
    openFetchNextPage,
    openHasNextPage,
    ownedFetchNextPage,
    ownedHasNextPage,
    personalFetchNextPage,
    personalHasNextPage,
  ]);

  // Returning the <LoadingView /> would lose the position tracking of the <ScheduleHeaderView />
  // list, so we rely on the <RefreshControl /> spinner instead.
  const isRefreshing =
    (appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedFetching) ||
    (appConfig.schedule.eventsShowOpenLfgs && isLfgOpenFetching) ||
    isLfgOwnedFetching ||
    isEventFetching ||
    isPersonalEventFetching ||
    refreshing;

  return (
    <AppView>
      <TimezoneWarningView />
      <ScheduleHeaderView
        selectedCruiseDay={selectedCruiseDay}
        setCruiseDay={handleSetCruiseDay}
        scrollToNow={scrollToNow}
      />
      <View style={[commonStyles.flex]}>
        {isSwitchingDays ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <ScheduleFlatList
            listRef={listRef}
            items={scheduleList}
            refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} enabled={false} />}
            setRefreshing={setRefreshing}
            initialScrollIndex={scrollNowIndex}
            onScrollThreshold={onScrollThreshold}
          />
        )}
      </View>
      <ScheduleFAB selectedDay={selectedCruiseDay} showLabel={showFabLabel} />
    </AppView>
  );
};
