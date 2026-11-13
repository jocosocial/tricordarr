import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {
  EventFeedbackSelectButtons,
  EventFeedbackSelectTab,
} from '#src/Components/Buttons/SegmentedButtons/EventFeedbackSelectButtons';
import {EventCard} from '#src/Components/Cards/Schedule/EventCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EventFeedbackLocationFilterMenu} from '#src/Components/Menus/EventFeedback/EventFeedbackLocationFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {EventFeedbackHostWarningView} from '#src/Components/Views/Warnings/EventFeedbackHostWarningView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getRoomName, matchRoomName} from '#src/Libraries/EventFeedbackRooms';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackEventListQuery} from '#src/Queries/EventFeedback/EventFeedbackQueries';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {EventData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventFeedbackSelectScreen>;

/**
 * Native replacement for `/eventfeedback`: pick a completed shadow/workshop event, then open the host form.
 *
 * We intentionally omit ScheduleHeaderView. Hosts typically fill this out right after their event,
 * and the API returns most recent events first, so filtering by cruise day is not useful here.
 */
export const EventFeedbackSelectScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.eventFeedbackHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.eventFeedback} urlPath={'/eventfeedback'}>
          <EventFeedbackSelectScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Lists eligible events (All) or the current user's submitted reports (Yours), optionally limited to one
 * location. The location starts from the `room` route param (room poster QR links).
 */
const EventFeedbackSelectScreenInner = ({navigation, route}: Props) => {
  const room = route.params?.room ? String(route.params.room).replace(/\+/g, ' ') : undefined;
  const {data, refetch, isLoading, isFetching} = useEventFeedbackEventListQuery(room);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {data: shadowEvents} = useEventsQuery({eventType: 'shadow'});
  const [locationOverride, setLocationOverride] = useState<string | null | undefined>(undefined);
  const [tab, setTab] = useState<EventFeedbackSelectTab>('all');
  const listRef = useRef<FlashListRef<EventData>>(null);
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: commonStyles.paddingSmall,
      }),
    [commonStyles.paddingSmall],
  );

  // Every distinct room across the full shadow event list, not just events eligible for feedback.
  const locations = useMemo(() => {
    const names = new Set<string>();
    shadowEvents?.forEach(event => event.location && names.add(getRoomName(event.location)));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [shadowEvents]);

  // The link's room name is freeform, so it is matched loosely. Once the user touches the filter their choice
  // (null = cleared) wins over the link.
  const linkedLocation = useMemo(() => matchRoomName(room, locations), [room, locations]);
  const locationName = locationOverride === undefined ? linkedLocation : (locationOverride ?? undefined);
  const onLocationChange = useCallback((name: string | undefined) => setLocationOverride(name ?? null), []);

  const events = useMemo(() => {
    if (!data) {
      return [];
    }
    const list = tab === 'yours' ? data.existingFeedback : data.events;
    return locationName ? list.filter(event => getRoomName(event.location) === locationName) : list;
  }, [data, tab, locationName]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <EventFeedbackLocationFilterMenu
            locations={locations}
            locationName={locationName}
            onLocationChange={onLocationChange}
          />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [locationName, locations, navigation, onLocationChange]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const renderItem = useCallback(
    ({item}: {item: EventData}) => {
      return (
        <View style={styles.cardContainer}>
          <EventCard
            eventData={item}
            hideFavorite={true}
            onPress={() =>
              navigation.push(CommonStackComponents.eventFeedbackFormScreen, {
                eventUID: item.uid,
              })
            }
          />
        </View>
      );
    },
    [navigation, styles.cardContainer],
  );

  const renderListHeader = useCallback(() => {
    return (
      <PaddedContentView padTop={true}>
        <EventFeedbackSelectButtons tab={tab} setTab={setTab} />
      </PaddedContentView>
    );
  }, [tab]);

  const {getListFooter} = useAppFlashList({data: events});

  const keyExtractor = useCallback((item: EventData) => item.eventID, []);

  if (isLoading && !data) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <EventFeedbackHostWarningView />
      <AppFlashList<EventData>
        ref={listRef}
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={{tab, locationName}}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
        renderListFooter={getListFooter}
      />
    </AppView>
  );
};
