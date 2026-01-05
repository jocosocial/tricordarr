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
import {useStyles} from '#src/Context/Contexts/StyleContext';
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
      enabled: cruiseDay !== undefined,
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
      enabled: cruiseDay !== undefined,
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
    options: {
      enabled: cruiseDay !== undefined,
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
    if (lfgOpenData) {
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

    // Filter by time overlap and exclude the input event itself
    const overlappingItems = allItems.filter(item => {
      if (!item.startTime || !item.endTime) {
        return false;
      }
      // Exclude the input event itself
      const isInputEvent =
        ('fezID' in item && 'fezID' in eventData && item.fezID === eventData.fezID) ||
        ('eventID' in item && 'eventID' in eventData && item.eventID === eventData.eventID);
      if (isInputEvent) {
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

    // Filter by "only your events" if enabled
    if (onlyYourEvents && profilePublicData?.header) {
      return overlappingItems.filter(item => {
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
    }

    return overlappingItems;
  }, [
    inputStartTime,
    inputEndTime,
    eventData,
    eventDataQuery,
    lfgOpenData,
    lfgJoinedData,
    lfgOwnedData,
    personalEventData,
    onlyYourEvents,
    profilePublicData,
    appConfig.schedule.overlapExcludeDurationHours,
  ]);

  const isFetching =
    isEventFetching || isLfgOpenFetching || isLfgJoinedFetching || isLfgOwnedFetching || isPersonalEventFetching;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchEvents(),
      refetchLfgOpen(),
      refetchLfgJoined(),
      refetchLfgOwned(),
      refetchPersonalEvents(),
    ]);
    setRefreshing(false);
  }, [refetchEvents, refetchLfgOpen, refetchLfgJoined, refetchLfgOwned, refetchPersonalEvents]);

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
