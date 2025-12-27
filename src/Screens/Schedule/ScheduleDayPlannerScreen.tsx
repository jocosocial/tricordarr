import {StackScreenProps} from '@react-navigation/stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ScheduleDayScreenActionsMenu} from '#src/Components/Menus/Schedule/ScheduleDayScreenActionsMenu';
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
import {AppIcons} from '#src/Enums/Icons';
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

const ScheduleDayPlannerScreenInner = ({route, navigation}: Props) => {
  const {adjustedCruiseDayToday, startDate} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(route.params?.cruiseDay ?? adjustedCruiseDayToday);
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
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
    isFetchingNextPage: isLfgJoinedFetchingNextPage,
    hasNextPage: joinedHasNextPage,
    fetchNextPage: joinedFetchNextPage,
    refetch: refetchLfgJoined,
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
    isFetchingNextPage: isPersonalEventFetchingNextPage,
    hasNextPage: personalHasNextPage,
    fetchNextPage: personalFetchNextPage,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    options: {
      enabled: isLoggedIn && !appConfig.preRegistrationMode,
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

  // Calculate day boundaries for the timeline
  const {dayStart, dayEnd} = useMemo(() => {
    return getDayBoundaries(startDate, selectedCruiseDay, appConfig.schedule.enableLateDayFlip);
  }, [startDate, selectedCruiseDay, appConfig.schedule.enableLateDayFlip]);

  // Calculate loading state
  const isLoading = isEventFetching || isLfgJoinedFetching || isPersonalEventFetching;
  const showLoading = isLoading && dayPlannerItems.length === 0;

  // Scroll to current time position in the timeline
  const scrollToNow = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }
    const now = new Date();
    const offset = getScrollOffsetForTime(now);
    scrollViewRef.current.scrollTo({y: offset, animated: true});
  }, []);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    const refreshes: Promise<any>[] = [refetchEvents()];
    if (!appConfig.preRegistrationMode) {
      refreshes.push(refetchLfgJoined(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
  }, [refetchEvents, refetchLfgJoined, refetchPersonalEvents, appConfig.preRegistrationMode]);

  // Header buttons
  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return null;
    }
    return (
      <View>
        <MaterialHeaderButtons>
          <ScheduleDayScreenActionsMenu onRefresh={onRefresh} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [isLoggedIn, onRefresh]);

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

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  const actions = [
    FabGroupAction({
      icon: AppIcons.new,
      label: 'Create Personal Event',
      onPress: () =>
        navigation.push(CommonStackComponents.personalEventCreateScreen, {
          cruiseDay: selectedCruiseDay,
        }),
    }),
    FabGroupAction({
      icon: AppIcons.personalEvent,
      label: 'Personal Events',
      onPress: () => navigation.push(CommonStackComponents.schedulePrivateEventsScreen),
    }),
  ];

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
      <BaseFABGroup actions={actions} openLabel={'Schedule'} icon={AppIcons.events} />
    </AppView>
  );
};
