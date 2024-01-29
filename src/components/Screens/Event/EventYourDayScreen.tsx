import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, EventStackComponents} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {ScheduleFilterSettings} from '../../../libraries/Types';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleYourCruiseDayMenu} from '../../Menus/Events/ScheduleYourCruiseDayMenu';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {ScheduleDayHeaderView} from '../../Views/Schedule/ScheduleDayHeaderView';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventYourDayScreen,
  NavigatorIDs.eventStack
>;

export const EventYourDayScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const {
    data: eventData,
    isLoading: isEventLoading,
    refetch: refetchEvents,
  } = useEventsQuery({
    cruiseDay: route.params.cruiseDay,
  });
  const {
    data: lfgJoinedData,
    isLoading: isLfgJoinedLoading,
    refetch: refetchLfgJoined,
  } = useLfgListQuery({
    cruiseDay: route.params.cruiseDay - 1,
    endpoint: 'joined',
    options: {
      enabled: appConfig.schedule.eventsShowJoinedLfgs,
    },
  });

  const {commonStyles} = useStyles();
  const listRef = useRef<FlatList<EventData | FezData>>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData)[]>([]);
  const {isLoggedIn} = useAuth();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchEvents().then(() => {
      refetchLfgJoined().then(() => {
        setRefreshing(false);
      });
    });
  }, [refetchEvents, refetchLfgJoined]);

  const buildScheduleList = useCallback(
    (filterSettings: ScheduleFilterSettings) => {
      let lfgList: FezData[] = [];
      if (filterSettings.showJoinedLfgs && lfgJoinedData) {
        lfgJoinedData.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));
      }
      let eventList: EventData[] = [];
      eventData?.map(event => {
        if (event.isFavorite) {
          eventList.push(event);
        }
      });
      setScheduleList(eventList);
    },
    [setScheduleList, eventData, lfgJoinedData],
  );

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleYourCruiseDayMenu route={route} />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, route]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    const filterSettings: ScheduleFilterSettings = {
      showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
    };
    buildScheduleList(filterSettings);
  }, [appConfig.schedule.eventsShowJoinedLfgs, appConfig.schedule.eventsShowOpenLfgs, buildScheduleList]);

  if ((appConfig.schedule.eventsShowJoinedLfgs && isLfgJoinedLoading) || isEventLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <View style={commonStyles.flex}>
        <View style={commonStyles.flex}>
          <ScheduleDayHeaderView selectedCruiseDay={route.params.cruiseDay} hideDayButtons={true} />
          <EventFlatList
            listRef={listRef}
            scheduleItems={scheduleList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            setRefreshing={setRefreshing}
          />
        </View>
      </View>
    </AppView>
  );
};
