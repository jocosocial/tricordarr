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
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {EventFeedbackFilterMenu} from '#src/Components/Menus/EventFeedback/EventFeedbackFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {EventFeedbackHostWarningView} from '#src/Components/Views/Warnings/EventFeedbackHostWarningView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackEventListQuery} from '#src/Queries/EventFeedback/EventFeedbackQueries';
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

const EventFeedbackSelectScreenInner = ({navigation, route}: Props) => {
  const room = route.params?.room ? String(route.params.room).replace(/\+/g, ' ') : undefined;
  const {data, refetch, isLoading, isFetching} = useEventFeedbackEventListQuery(room);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const [tab, setTab] = useState<EventFeedbackSelectTab>('all');
  const [tabInitialized, setTabInitialized] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const listRef = useRef<FlashListRef<EventData>>(null);
  const {commonStyles} = useStyles();

  const showPerformer = (data?.performerAttached.length ?? 0) > 0;
  const showRoom = (data?.matchingRoom.length ?? 0) > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: commonStyles.paddingSmall,
      }),
    [commonStyles.paddingSmall],
  );

  useEffect(() => {
    if (!data || tabInitialized) {
      return;
    }
    if (data.performerAttached.length > 0) {
      setTab('performer');
    } else if (data.matchingRoom.length > 0) {
      setTab('room');
    } else {
      setTab('all');
    }
    setTabInitialized(true);
  }, [data, tabInitialized]);

  useEffect(() => {
    if (tab === 'performer' && !showPerformer) {
      setTab('all');
    } else if (tab === 'room' && !showRoom) {
      setTab('all');
    }
  }, [showPerformer, showRoom, tab]);

  const events = useMemo(() => {
    if (!data) {
      return [];
    }
    if (alreadySubmitted) {
      return data.existingFeedback;
    }
    switch (tab) {
      case 'performer':
        return data.performerAttached;
      case 'room':
        return data.matchingRoom;
      default:
        return data.events;
    }
  }, [alreadySubmitted, data, tab]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <EventFeedbackFilterMenu alreadySubmitted={alreadySubmitted} onAlreadySubmittedChange={setAlreadySubmitted} />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [alreadySubmitted, navigation]);

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
    if (alreadySubmitted || (!showPerformer && !showRoom)) {
      return null;
    }
    return (
      <PaddedContentView padTop={true}>
        <EventFeedbackSelectButtons tab={tab} setTab={setTab} showPerformer={showPerformer} showRoom={showRoom} />
      </PaddedContentView>
    );
  }, [alreadySubmitted, showPerformer, showRoom, tab]);

  const renderListFooter = useCallback(() => {
    if (events.length > 0) {
      return <EndResultsFooter />;
    }
    return <NoResultsFooter />;
  }, [events.length]);

  const keyExtractor = useCallback((item: EventData) => item.eventID, []);

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <EventFeedbackHostWarningView />
      <AppFlashList<EventData>
        ref={listRef}
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={{alreadySubmitted, tab}}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
        renderListFooter={renderListFooter}
      />
    </AppView>
  );
};
