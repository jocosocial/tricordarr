import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToNow} from '#src/Hooks/useScrollToNow';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {EventData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventLocationScreen>;

/**
 * Events whose location matches a room name. Native counterpart to `/events?location=`.
 */
export const EventLocationScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/events'}>
        <EventLocationScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const EventLocationScreenInner = ({navigation, route}: Props) => {
  const {location, cruiseDay: cruiseDayInitial} = route.params;
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashListRef<EventData>>(null);
  const [eventList, setEventList] = useState<EventData[]>([]);

  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setEventList([]), []),
    defaultCruiseDay: cruiseDayInitial,
  });

  const {data, refetch, isLoading, isError} = useEventsQuery({
    location,
    cruiseDay: selectedCruiseDay === 0 ? undefined : selectedCruiseDay,
  });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {scrollToNow} = useScrollToNow({
    items: eventList,
    listRef,
    selectedCruiseDay,
  });

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventHelpScreen)}
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

  useEffect(() => {
    if (data) {
      setEventList(data);
      onDataLoaded();
    }
  }, [data, onDataLoaded]);

  useEffect(() => {
    if (isError) {
      onQueryError();
    }
  }, [isError, onQueryError]);

  return (
    <AppView>
      <TimezoneWarningView />
      <ListTitleView title={location} />
      <ScheduleHeaderView
        selectedCruiseDay={selectedCruiseDay}
        setCruiseDay={handleSetCruiseDay}
        scrollToNow={scrollToNow}
        enableAll={true}
      />
      <View style={commonStyles.flex}>
        {isLoading || isSwitchingDays ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <ScheduleFlatList
            listRef={listRef}
            items={eventList}
            showDayInDividers={selectedCruiseDay === 0}
            separator={selectedCruiseDay === 0 ? 'day' : 'time'}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
    </AppView>
  );
};
