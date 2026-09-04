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

/**
 * Lists eligible events (All) or the current user's submitted reports (Yours).
 */
const EventFeedbackSelectScreenInner = ({navigation, route}: Props) => {
  const room = route.params?.room ? String(route.params.room).replace(/\+/g, ' ') : undefined;
  const {data, refetch, isLoading, isFetching} = useEventFeedbackEventListQuery(room);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
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

  const events = useMemo(() => {
    if (!data) {
      return [];
    }
    if (tab === 'yours') {
      return data.existingFeedback;
    }
    return data.events;
  }, [data, tab]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

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
        extraData={{tab}}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
        renderListFooter={renderListFooter}
      />
    </AppView>
  );
};
