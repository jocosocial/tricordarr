import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Menu, Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ScheduleOverlapTimelineView} from '#src/Components/Views/Schedule/ScheduleOverlapTimelineView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ScheduleOverlapViewMode} from '#src/Enums/ScheduleOverlapViewMode';
import {useMenu} from '#src/Hooks/useMenu';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {calcCruiseDayTime, eventsOverlap, getDurationString} from '#src/Libraries/DateTime';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleOverlapScreen>;

export const ScheduleOverlapScreen = ({navigation, route}: Props) => {
  const {eventData} = route.params;
  const {startDate, endDate} = useCruise();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();
  const {isLoggedIn} = useSession();
  const [viewMode, setViewMode] = useState(appConfig.schedule.overlapViewMode);
  const {tzAtTime} = useTimeZone();
  const {getIsDisabled} = useFeature();
  const {preRegistrationMode} = usePreRegistration();
  // Pre-registration users can't list what they've joined, only what they own.
  const fezEndpoint = preRegistrationMode ? 'owner' : 'joined';
  const listRef = useRef<FlashListRef<EventData | FezData>>(null);
  // Logged-out users have no favorites (isFavorite is always false, see the note in
  // src/Queries/Events/EventQueries.ts) and can't favorite, so they start on all events.
  const defaultOnlyYourEvents = isLoggedIn && appConfig.schedule.overlapOnlyYourEvents;
  const [onlyYourEvents, setOnlyYourEvents] = useState(defaultOnlyYourEvents);
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();

  // Extract startTime, endTime, and cruiseDay from eventData
  const inputStartTime = eventData.startTime;
  const inputEndTime = eventData.endTime;
  const cruiseDay = useMemo(() => {
    if (!inputStartTime) {
      return undefined;
    }
    // Use timezone-aware cruise day calculation
    const cruiseDayTime = calcCruiseDayTime(new Date(inputStartTime), startDate, endDate, tzAtTime);
    return cruiseDayTime.cruiseDay;
  }, [inputStartTime, startDate, endDate, tzAtTime]);

  // Query all three data types for the same cruiseDay
  const {
    data: eventDataQuery,
    isFetching: isEventFetching,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: cruiseDay,
    options: {
      enabled: cruiseDay !== undefined,
    },
  });

  const {
    data: lfgOpenData,
    isFetching: isLfgOpenFetching,
    refetch: refetchLfgOpen,
  } = useLfgListQuery({
    cruiseDay: cruiseDay !== undefined ? cruiseDay - 1 : undefined,
    endpoint: 'open',
    hidePast: false,
    options: {
      enabled: cruiseDay !== undefined && !preRegistrationMode && appConfig.schedule.eventsShowOpenLfgs,
    },
  });

  const {
    data: lfgJoinedData,
    isFetching: isLfgJoinedFetching,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: cruiseDay !== undefined ? cruiseDay - 1 : undefined,
    endpoint: fezEndpoint,
    hidePast: false,
    options: {
      enabled: cruiseDay !== undefined,
    },
  });

  const {
    data: personalEventData,
    isFetching: isPersonalEventFetching,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: cruiseDay !== undefined ? cruiseDay - 1 : undefined,
    hidePast: false,
    endpoint: fezEndpoint,
    options: {
      enabled: cruiseDay !== undefined,
    },
  });

  // Get the ID of the route's eventData to ensure it's always included
  const routeEventId = 'fezID' in eventData ? eventData.fezID : eventData.eventID;

  // Combine and filter all items
  const filteredItems = useMemo(() => {
    if (!inputStartTime || !inputEndTime) {
      return [];
    }

    const allItems: (EventData | FezData)[] = [];

    // Add Events
    if (eventDataQuery) {
      allItems.push(...eventDataQuery);
    }

    // Add LFGs
    if (lfgOpenData && appConfig.schedule.eventsShowOpenLfgs && !onlyYourEvents) {
      lfgOpenData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }
    if (lfgJoinedData) {
      lfgJoinedData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }

    // Add PersonalEvents
    if (personalEventData) {
      personalEventData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }

    // The opened item may be in no query result, e.g. an unjoined LFG, since the open LFG query is excluded under
    // the Only Your Events filter or by the setting. Gated on eventDataQuery so the loading spinner, which relies on
    // an empty filteredItems, still shows on first load.
    if (eventDataQuery && !allItems.some(item => ('fezID' in item ? item.fezID : item.eventID) === routeEventId)) {
      allItems.push(eventData);
    }

    // Filter by time overlap
    const overlappingItems = allItems.filter(item => {
      if (!item.startTime || !item.endTime) {
        return false;
      }
      if (!eventsOverlap(inputStartTime, inputEndTime, item.startTime, item.endTime)) {
        return false;
      }
      // Always include the route's eventData, even if it exceeds overlapExcludeDurationHours
      const itemId = 'fezID' in item ? item.fezID : item.eventID;
      if (itemId === routeEventId) {
        return true;
      }
      // Filter out events with duration >= overlapExcludeDurationHours
      const durationHours = (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60 * 60);
      if (durationHours >= appConfig.schedule.overlapExcludeDurationHours) {
        return false;
      }
      return true;
    });

    // Filter by feature flags. Preregistration needs no filtering here: the open LFG query is off
    // and the others only return the user's own LFGs and events.
    const featureFilteredItems = overlappingItems.filter(item => {
      // Only filter FezData items (LFGs and personal events)
      if ('fezID' in item) {
        // Exclude LFGs if feature is disabled
        if (FezType.isLFGType(item.fezType)) {
          if (getIsDisabled(SwiftarrFeature.friendlyfez)) {
            return false;
          }
        }
        // Exclude personal events if feature is disabled
        if (item.fezType === FezType.personalEvent) {
          if (getIsDisabled(SwiftarrFeature.personalevents)) {
            return false;
          }
        }
      }
      return true;
    });

    // Only your events: keep joined/personal items, favorited events, and always the opened item itself.
    if (onlyYourEvents) {
      const userFilteredItems = featureFilteredItems.filter(item => {
        if (('fezID' in item ? item.fezID : item.eventID) === routeEventId) {
          return true;
        }
        if ('fezID' in item) {
          return true; // already from joined/personal queries
        }
        return item.isFavorite === true;
      });
      // Sort by startTime
      return userFilteredItems.sort((a, b) => {
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        // Return 0 if both startTime are undefined (order remains unchanged)
        return 0;
      });
    }

    // Sort by startTime
    return featureFilteredItems.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      // Return 0 if both startTime are undefined (order remains unchanged)
      return 0;
    });
  }, [
    inputStartTime,
    inputEndTime,
    eventData,
    routeEventId,
    eventDataQuery,
    lfgOpenData,
    lfgJoinedData,
    personalEventData,
    onlyYourEvents,
    appConfig.schedule.overlapExcludeDurationHours,
    appConfig.schedule.eventsShowOpenLfgs,
    getIsDisabled,
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: {
          ...commonStyles.paddingVertical,
          ...commonStyles.paddingHorizontal,
        },
        hintText: {
          textAlign: 'center',
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [commonStyles, theme.colors.onSurfaceVariant],
  );

  const isFetching = isEventFetching || isLfgOpenFetching || isLfgJoinedFetching || isPersonalEventFetching;

  const {refreshing, onRefresh} = useRefresh({
    refresh: useCallback(async () => {
      const refreshes: Promise<any>[] = [refetchEvents(), refetchLfgJoined(), refetchPersonalEvents()];
      if (!preRegistrationMode && appConfig.schedule.eventsShowOpenLfgs) {
        refreshes.push(refetchLfgOpen());
      }
      await Promise.all(refreshes);
    }, [
      refetchEvents,
      refetchLfgOpen,
      refetchLfgJoined,
      refetchPersonalEvents,
      preRegistrationMode,
      appConfig.schedule.eventsShowOpenLfgs,
    ]),
    isRefreshing: isFetching,
  });

  // Nothing but the opened item is left, so point at the filter. `every` is also true for an empty list.
  const showFilterHint =
    onlyYourEvents &&
    !isFetching &&
    filteredItems.every(item => ('fezID' in item ? item.fezID : item.eventID) === routeEventId);

  // Changing the defaults in Settings (reachable from this screen's Actions menu) or logging in applies when you come
  // back; the effects only fire when a default's value changes, so they never undo a toggle otherwise.
  useEffect(() => setViewMode(appConfig.schedule.overlapViewMode), [appConfig.schedule.overlapViewMode]);
  useEffect(() => setOnlyYourEvents(defaultOnlyYourEvents), [defaultOnlyYourEvents]);

  /** Flip between the list and Timeline views for this visit only; the saved default is not changed. */
  const handleToggleViewMode = useCallback(() => {
    setViewMode(current =>
      current === ScheduleOverlapViewMode.timeline ? ScheduleOverlapViewMode.list : ScheduleOverlapViewMode.timeline,
    );
  }, []);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <MenuAnchor
            title={'Timeline View'}
            active={viewMode === ScheduleOverlapViewMode.timeline}
            onPress={handleToggleViewMode}
            iconName={AppIcons.dayPlanner}
          />
          <MenuAnchor
            title={'Only Your Events'}
            active={onlyYourEvents}
            onPress={() => setOnlyYourEvents(!onlyYourEvents)}
            iconName={AppIcons.user}
          />
          <AppMenu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
            <Menu.Item
              title={'Settings'}
              leadingIcon={AppIcons.settings}
              onPress={() => {
                closeMenu();
                commonNavigation.push(CommonStackComponents.eventSettingsScreen);
              }}
            />
            <Menu.Item
              title={'Help'}
              leadingIcon={AppIcons.help}
              onPress={() => {
                closeMenu();
                commonNavigation.push(CommonStackComponents.scheduleOverlapHelpScreen);
              }}
            />
          </AppMenu>
        </MaterialHeaderButtons>
      </View>
    );
  }, [onlyYourEvents, visible, openMenu, closeMenu, commonNavigation, viewMode, handleToggleViewMode]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const durationString = getDurationString(
    eventData.startTime,
    eventData.endTime,
    eventData.timeZoneID,
    true,
    appConfig.schedule.timeZoneLabelMode,
  );

  return (
    <AppView>
      <TimezoneWarningView />
      <ListTitleView title={eventData.title} subtitle={durationString} />
      {showFilterHint && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            No other events of yours overlap this one. Turn off the Only Your Events filter (person icon) in the header
            to see all events.
          </Text>
        </View>
      )}
      <View style={[commonStyles.flex]}>
        {isFetching && filteredItems.length === 0 ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : viewMode === ScheduleOverlapViewMode.timeline && cruiseDay !== undefined && filteredItems.length > 0 ? (
          <ScheduleOverlapTimelineView
            items={filteredItems}
            cruiseDay={cruiseDay}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        ) : (
          <ScheduleFlatList
            items={filteredItems}
            listRef={listRef}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            separator={'time'}
          />
        )}
      </View>
    </AppView>
  );
};
