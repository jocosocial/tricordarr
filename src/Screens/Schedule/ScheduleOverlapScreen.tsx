import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {calcCruiseDayTime, eventsOverlap, getDurationString} from '#src/Libraries/DateTime';
import {CommonStackComponents, CommonStackParamList, useCommonStack} from '#src/Navigation/CommonScreens';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {useLfgListQuery, usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.scheduleOverlapScreen>;

export const ScheduleOverlapScreen = ({navigation, route}: Props) => {
  const {eventData} = route.params;
  const {startDate, endDate} = useCruise();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {data: profilePublicData} = useUserProfileQuery();
  const {getIsDisabled} = useFeature();
  const {preRegistrationMode} = usePreRegistration();
  const listRef = useRef<FlashListRef<EventData | FezData>>(null);
  const [onlyYourEvents, setOnlyYourEvents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();

  // Extract startTime, endTime, and cruiseDay from eventData
  const inputStartTime = eventData.startTime;
  const inputEndTime = eventData.endTime;
  const cruiseDay = useMemo(() => {
    if (!inputStartTime) {
      return undefined;
    }
    const cruiseDayTime = calcCruiseDayTime(new Date(inputStartTime), startDate, endDate);
    return cruiseDayTime.cruiseDay;
  }, [inputStartTime, startDate, endDate]);

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
    endpoint: 'joined',
    hidePast: false,
    options: {
      enabled: cruiseDay !== undefined && !preRegistrationMode,
    },
  });

  const {
    data: lfgOwnedData,
    isFetching: isLfgOwnedFetching,
    refetch: refetchLfgOwned,
  } = useLfgListQuery({
    cruiseDay: cruiseDay !== undefined ? cruiseDay - 1 : undefined,
    endpoint: 'owner',
    hidePast: false,
    options: {
      enabled: cruiseDay !== undefined && !preRegistrationMode,
    },
  });

  const {
    data: personalEventData,
    isFetching: isPersonalEventFetching,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: cruiseDay !== undefined ? cruiseDay - 1 : undefined,
    hidePast: false,
    options: {
      enabled: cruiseDay !== undefined && !preRegistrationMode,
    },
  });

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
    if (lfgOpenData && appConfig.schedule.eventsShowOpenLfgs) {
      lfgOpenData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }
    if (lfgJoinedData) {
      lfgJoinedData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }
    if (lfgOwnedData) {
      lfgOwnedData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }

    // Add PersonalEvents
    if (personalEventData) {
      personalEventData.pages.forEach(page => {
        allItems.push(...page.fezzes);
      });
    }

    // Filter by time overlap
    const overlappingItems = allItems.filter(item => {
      if (!item.startTime || !item.endTime) {
        return false;
      }
      if (!eventsOverlap(inputStartTime, inputEndTime, item.startTime, item.endTime)) {
        return false;
      }
      // Filter out events with duration >= overlapExcludeDurationHours
      const durationHours = (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60 * 60);
      if (durationHours >= appConfig.schedule.overlapExcludeDurationHours) {
        return false;
      }
      return true;
    });

    // Filter by feature flags and preregistration mode
    const featureFilteredItems = overlappingItems.filter(item => {
      // Only filter FezData items (LFGs and personal events)
      if ('fezID' in item) {
        // Exclude LFGs if feature is disabled or in preregistration mode
        if (FezType.isLFGType(item.fezType)) {
          if (getIsDisabled(SwiftarrFeature.friendlyfez) || preRegistrationMode) {
            return false;
          }
        }
        // Exclude personal events if feature is disabled or in preregistration mode
        if (item.fezType === FezType.personalEvent) {
          if (getIsDisabled(SwiftarrFeature.personalevents) || preRegistrationMode) {
            return false;
          }
        }
      }
      return true;
    });

    // Filter by "only your events" if enabled
    if (onlyYourEvents && profilePublicData?.header) {
      const userFilteredItems = featureFilteredItems.filter(item => {
        if ('fezID' in item) {
          // LFGs or PersonalEvents: check if user is participant or owner
          return (
            FezData.isParticipant(item, profilePublicData.header) ||
            item.owner.userID === profilePublicData.header.userID
          );
        } else {
          // Events: check if favorited
          return item.isFavorite === true;
        }
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
    eventDataQuery,
    lfgOpenData,
    lfgJoinedData,
    lfgOwnedData,
    personalEventData,
    onlyYourEvents,
    profilePublicData,
    appConfig.schedule.overlapExcludeDurationHours,
    appConfig.schedule.eventsShowOpenLfgs,
    getIsDisabled,
    preRegistrationMode,
  ]);

  const isFetching =
    isEventFetching || isLfgOpenFetching || isLfgJoinedFetching || isLfgOwnedFetching || isPersonalEventFetching;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const refreshes: Promise<any>[] = [refetchEvents()];
    if (!preRegistrationMode) {
      if (appConfig.schedule.eventsShowOpenLfgs) {
        refreshes.push(refetchLfgOpen());
      }
      refreshes.push(refetchLfgJoined(), refetchLfgOwned(), refetchPersonalEvents());
    }
    await Promise.all(refreshes);
    setRefreshing(false);
  }, [
    refetchEvents,
    refetchLfgOpen,
    refetchLfgJoined,
    refetchLfgOwned,
    refetchPersonalEvents,
    preRegistrationMode,
    appConfig.schedule.eventsShowOpenLfgs,
  ]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
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
                commonNavigation.push(CommonStackComponents.scheduleHelpScreen);
              }}
            />
          </AppMenu>
        </MaterialHeaderButtons>
      </View>
    );
  }, [onlyYourEvents, visible, openMenu, closeMenu, commonNavigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const durationString = getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true);

  return (
    <AppView>
      <ListTitleView title={eventData.title} subtitle={durationString} />
      <View style={[commonStyles.flex]}>
        {isFetching && filteredItems.length === 0 ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
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
