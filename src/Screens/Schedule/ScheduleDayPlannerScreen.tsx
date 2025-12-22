import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {DayPlannerTimelineView} from '#src/Components/Views/Schedule/DayPlannerTimelineView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {buildDayPlannerItems, getDayBoundaries, getScrollOffsetForTime} from '#src/Libraries/DayPlanner';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleDayPlannerScreen>;

export const ScheduleDayPlannerScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/dayplanner'}>
      <ScheduleDayPlannerScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const ScheduleDayPlannerScreenInner = ({route}: Props) => {
  const {adjustedCruiseDayToday, startDate} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(route.params?.cruiseDay ?? adjustedCruiseDayToday);
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch events with dayplanner=true (only favorited/following events)
  const {
    data: eventData,
    isFetching: isEventFetching,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: selectedCruiseDay,
    dayplanner: true,
    options: {
      enabled: isLoggedIn,
    },
  });

  // Fetch joined LFGs (matches web app behavior)
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
      enabled: isLoggedIn && !appConfig.preRegistrationMode,
    },
  });

  // Fetch personal/private events
  const {
    data: personalEventData,
    isFetching: isPersonalEventFetching,
    refetch: refetchPersonalEvents,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    options: {
      enabled: isLoggedIn && !appConfig.preRegistrationMode,
    },
  });

  // Handle pagination for LFGs and personal events
  useEffect(() => {
    if (joinedHasNextPage) {
      joinedFetchNextPage();
    }
    if (personalHasNextPage) {
      personalFetchNextPage();
    }
  }, [joinedFetchNextPage, joinedHasNextPage, personalFetchNextPage, personalHasNextPage]);

  // Build day planner items from all data sources
  const dayPlannerItems = useMemo(() => {
    return buildDayPlannerItems(eventData, lfgJoinedData, personalEventData);
  }, [eventData, lfgJoinedData, personalEventData]);

  // Calculate day boundaries for the timeline
  const {dayStart, dayEnd} = useMemo(() => {
    return getDayBoundaries(startDate, selectedCruiseDay);
  }, [startDate, selectedCruiseDay]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const refreshes: Promise<unknown>[] = [refetchEvents()];
    if (!appConfig.preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
    setRefreshing(false);
  }, [refetchEvents, refetchLfgJoined, refetchPersonalEvents, appConfig.preRegistrationMode]);

  // Scroll to current time position in the timeline
  const scrollToNow = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }
    const now = new Date();
    const offset = getScrollOffsetForTime(now, dayStart, dayEnd);
    scrollViewRef.current.scrollTo({y: offset, animated: true});
  }, [dayStart, dayEnd]);

  // Auto-scroll to current time on initial load for any selected day
  useEffect(() => {
    if (scrollViewRef.current && !showLoading) {
      // Use a small delay to ensure the ScrollView is fully mounted and items are rendered
      const timer = setTimeout(() => {
        scrollToNow();
      }, 100);
      return () => clearTimeout(timer);
    }
    // Only run on mount or when the selected day changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCruiseDay]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  const isLoading = isEventFetching || isLfgJoinedFetching || isPersonalEventFetching;
  const showLoading = isLoading && !refreshing && dayPlannerItems.length === 0;

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
          <DayPlannerTimelineView ref={scrollViewRef} items={dayPlannerItems} dayStart={dayStart} dayEnd={dayEnd} />
        )}
      </View>
    </AppView>
  );
};
