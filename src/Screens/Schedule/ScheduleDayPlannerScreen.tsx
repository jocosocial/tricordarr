import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {SchedulePersonalEventCreateFAB} from '#src/Components/Buttons/FloatingActionButtons/SchedulePersonalEventCreateFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {DayPlannerTimelineView} from '#src/Components/Views/Schedule/DayPlannerTimelineView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {buildDayPlannerItems, getDayBoundaries, getScrollOffsetForTimeOfDay} from '#src/Libraries/DayPlanner';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

export const ScheduleDayPlannerScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/dayplanner'}>
        <ScheduleDayPlannerScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const ScheduleDayPlannerScreenInner = ({route, navigation}: Props) => {
  const {adjustedCruiseDayToday, startDate} = useCruise();
  const cruiseDayParam = route.params?.cruiseDay;
  // Day Planner doesn't support cruiseDay 0 (all days).
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(
    cruiseDayParam === 0 || cruiseDayParam === undefined ? adjustedCruiseDayToday : cruiseDayParam,
  );
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const {preRegistrationMode} = usePreRegistration();

  // Fetch events with dayplanner=true (only favorited/following events)
  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: selectedCruiseDay,
    dayplanner: true,
  });

  // Fetch joined LFGs (matches web app behavior)
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    isFetchingNextPage: isLfgJoinedFetchingNextPage,
    hasNextPage: joinedHasNextPage,
    fetchNextPage: joinedFetchNextPage,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'joined',
    hidePast: false,
    options: {
      enabled: !preRegistrationMode,
    },
  });

  // Fetch personal/private events
  const {
    data: personalEventData,
    isLoading: isPersonalEventLoading,
    isFetchingNextPage: isPersonalEventFetchingNextPage,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    options: {
      enabled: !preRegistrationMode,
    },
  });

  // Handle pagination for LFGs and personal events
  // Automatically fetch all pages to show complete day schedule
  useEffect(() => {
    if (joinedHasNextPage && !isLfgJoinedFetchingNextPage) {
      joinedFetchNextPage();
    }
    if (personalHasNextPage && !isPersonalEventFetchingNextPage) {
      personalFetchNextPage();
    }
  }, [
    joinedFetchNextPage,
    joinedHasNextPage,
    isLfgJoinedFetchingNextPage,
    personalFetchNextPage,
    personalHasNextPage,
    isPersonalEventFetchingNextPage,
  ]);

  // Build day planner items from all data sources
  const dayPlannerItems = useMemo(() => {
    return buildDayPlannerItems(eventData, lfgJoinedData, personalEventData);
  }, [eventData, lfgJoinedData, personalEventData]);

  // Boat timezone for the selected day (from first event/LFG/personal, or port). Used for day boundaries and labels.
  const boatTimeZoneID = useMemo(() => {
    const fromEvent = eventData?.[0]?.timeZoneID;
    const fromLfg = lfgJoinedData?.pages?.[0]?.fezzes?.[0]?.timeZoneID;
    const fromPersonal = personalEventData?.pages?.[0]?.fezzes?.[0]?.timeZoneID;
    return fromEvent ?? fromLfg ?? fromPersonal ?? appConfig.portTimeZoneID;
  }, [appConfig.portTimeZoneID, eventData, lfgJoinedData?.pages, personalEventData?.pages]);

  // Calculate day boundaries for the timeline (midnight in boat TZ)
  const {dayStart, dayEnd} = useMemo(() => {
    return getDayBoundaries(startDate, selectedCruiseDay, appConfig.schedule.enableLateDayFlip, boatTimeZoneID);
  }, [startDate, selectedCruiseDay, appConfig.schedule.enableLateDayFlip, boatTimeZoneID]);

  // Calculate loading state - only show loading spinner on initial fetch (when no cached data exists)
  // Using isLoading instead of isFetching avoids showing spinner on refetch
  const showLoading = isEventLoading || isLfgJoinedLoading || isPersonalEventLoading;

  // Scroll to current time-of-day position in the timeline (boat TZ). Position is consistent regardless of which cruise day is selected.
  const scrollToNow = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }
    const offset = getScrollOffsetForTimeOfDay(boatTimeZoneID, dayStart);
    scrollViewRef.current.scrollTo({y: offset, animated: true});
  }, [boatTimeZoneID, dayStart]);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    const refreshes: Promise<any>[] = [refetchEvents()];
    if (!preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
  }, [refetchEvents, refetchLfgJoined, refetchPersonalEvents, preRegistrationMode]);

  // Header buttons
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <ScheduleDayScreenActionsMenu
            onRefresh={onRefresh}
            helpScreen={CommonStackComponents.scheduleDayPlannerHelpScreen}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [onRefresh]);

  // Set header buttons
  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  // Auto-scroll to current time on initial load for any selected day
  useEffect(() => {
    if (scrollViewRef.current && !showLoading) {
      // Use requestAnimationFrame to ensure scroll happens after layout/render is complete
      // This is more reliable than setTimeout as it syncs with the rendering cycle
      const rafId = requestAnimationFrame(() => {
        scrollToNow();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [selectedCruiseDay, showLoading, scrollToNow]);

  return (
    <AppView>
      <TimezoneWarningView />
      <ScheduleHeaderView
        selectedCruiseDay={selectedCruiseDay}
        setCruiseDay={setSelectedCruiseDay}
        scrollToNow={scrollToNow}
      />
      <View style={commonStyles.flex}>
        {showLoading ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <DayPlannerTimelineView
            ref={scrollViewRef}
            items={dayPlannerItems}
            dayStart={dayStart}
            dayEnd={dayEnd}
            timeZoneID={boatTimeZoneID}
            selectedCruiseDay={selectedCruiseDay}
          />
        )}
      </View>
      {!preRegistrationMode && <SchedulePersonalEventCreateFAB />}
    </AppView>
  );
};
