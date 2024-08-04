import {AppView} from '../../Views/AppView.tsx';
import {ScheduleHeaderView} from '../../Views/Schedule/ScheduleHeaderView.tsx';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator.tsx';
import {EventStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {ScheduleFAB} from '../../Buttons/FloatingActionButtons/ScheduleFAB.tsx';
import {FlatList, RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {ScheduleEventFilterMenu} from '../../Menus/Events/ScheduleEventFilterMenu.tsx';
import {EventDayScreenActionsMenu} from '../../Menus/Events/EventDayScreenActionsMenu.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {useEventsQuery} from '../../Queries/Events/EventQueries.tsx';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries.ts';
import {usePersonalEventsQuery} from '../../Queries/PersonalEvent/PersonalEventQueries.tsx';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {buildScheduleList, getScheduleScrollIndex} from '../../../libraries/Schedule.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import useDateTime, {calcCruiseDayTime} from '../../../libraries/DateTime.ts';

type Props = NativeStackScreenProps<EventStackParamList, EventStackComponents.scheduleDayScreen>;
export const ScheduleDayScreen = ({navigation}: Props) => {
  const {adjustedCruiseDayToday, startDate, endDate} = useCruise();
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday);
  const {isLoggedIn} = useAuth();
  const {commonStyles} = useStyles();
  const listRef = useRef<FlatList<EventData | FezData | PersonalEventData>>(null);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData | PersonalEventData)[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const {appConfig} = useConfig();
  const {scheduleFilterSettings} = useFilter();
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');

  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: selectedCruiseDay,
    options: {
      enabled: isLoggedIn,
    },
  });
  const {
    data: lfgOpenData,
    isLoading: isLfgOpenLoading,
    refetch: refetchLfgOpen,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'open',
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowOpenLfgs,
    },
  });
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: selectedCruiseDay - 1,
    endpoint: 'joined',
    options: {
      enabled: isLoggedIn && appConfig.schedule.eventsShowJoinedLfgs,
    },
  });
  const {
    data: personalEventData,
    isLoading: isPersonalEventLoading,
    refetch: refetchPersonalEvents,
  } = usePersonalEventsQuery({
    cruiseDay: selectedCruiseDay - 1,
    options: {
      enabled: isLoggedIn,
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchEvents(), refetchLfgJoined(), refetchLfgOpen(), refetchPersonalEvents()]);
    setRefreshing(false);
  }, [refetchEvents, refetchLfgJoined, refetchLfgOpen, refetchPersonalEvents]);

  const scrollToNow = useCallback(() => {
    if (scheduleList.length === 0 || !listRef.current) {
      return;
    }
    if (scrollNowIndex === 0) {
      listRef.current.scrollToOffset({offset: 0});
    } else if (scrollNowIndex === scheduleList.length - 1) {
      listRef.current.scrollToEnd();
    } else {
      listRef.current.scrollToIndex({
        index: scrollNowIndex,
      });
    }
  }, [scheduleList, scrollNowIndex]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Now'} onPress={scrollToNow} />
          <ScheduleEventFilterMenu />
          <EventDayScreenActionsMenu onRefresh={onRefresh} />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    console.log('[EventDayScreen.tsx] Starting buildScheduleList useEffect.');
    const listData = buildScheduleList(
      scheduleFilterSettings,
      lfgJoinedData,
      lfgOpenData,
      eventData,
      personalEventData,
    );
    setScheduleList(listData);
  }, [scheduleFilterSettings, lfgJoinedData, lfgOpenData, eventData, personalEventData]);

  useEffect(() => {
    const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
    setScrollNowIndex(getScheduleScrollIndex(nowDayTime, scheduleList, startDate, endDate, appConfig.portTimeZoneID));
  }, [endDate, getScheduleScrollIndex, minutelyUpdatingDate, scheduleList, startDate]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (
    (appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedLoading) ||
    (appConfig.schedule.eventsShowOpenLfgs && isLfgOpenLoading) ||
    isEventLoading ||
    isPersonalEventLoading
  ) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={setSelectedCruiseDay} />
      <View style={commonStyles.flex}>
        <EventFlatList
          listRef={listRef}
          scheduleItems={scheduleList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
          setRefreshing={setRefreshing}
        />
      </View>
      <ScheduleFAB />
    </AppView>
  );
};
