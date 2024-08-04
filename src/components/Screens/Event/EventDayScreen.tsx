import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {EventStackParamList} from '../../Navigation/Stacks/EventStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/Events/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {CruiseDayTime, ScheduleFilterSettings} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';
import {ScheduleEventFilterMenu} from '../../Menus/Events/ScheduleEventFilterMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {ScheduleFAB} from '../../Buttons/FloatingActionButtons/ScheduleFAB.tsx';
import {ScheduleDayHeaderView} from '../../Views/Schedule/ScheduleDayHeaderView';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {EventDayScreenActionsMenu} from '../../Menus/Events/EventDayScreenActionsMenu';
import {usePersonalEventsQuery} from '../../Queries/PersonalEvent/PersonalEventQueries.tsx';
import {ScheduleHeaderView} from '../../Views/Schedule/ScheduleHeaderView.tsx';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventDayScreen,
  NavigatorIDs.eventStack
>;

export const EventDayScreen = ({navigation, route}: Props) => {
  const {eventTypeFilter, eventFavoriteFilter, eventPersonalFilter, eventLfgFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();


  const {commonStyles} = useStyles();
  const {startDate, endDate} = useCruise();
  const listRef = useRef<FlatList<EventData | FezData | PersonalEventData>>(null);
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleList, setScheduleList] = useState<(EventData | FezData | PersonalEventData)[]>([]);

  const getScrollIndex = useCallback(
    (nowDayTime: CruiseDayTime, itemList: (EventData | FezData | PersonalEventData)[]) => {
      for (let i = 0; i < itemList.length; i++) {
        // Creating a dedicated variable makes the parser happier.
        const scheduleItem = itemList[i];
        if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
          break;
        }
        const itemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const tzOffset = getTimeZoneOffset(appConfig.portTimeZoneID, scheduleItem.timeZoneID, scheduleItem.startTime);

        if (
          nowDayTime.cruiseDay === itemStartDayTime.cruiseDay &&
          nowDayTime.dayMinutes - tzOffset <= itemStartDayTime.dayMinutes
        ) {
          return i - 1;
        }
      }
      // If we have ScheduleItems but Now is beyond the last one of the day, simply set the index to the last possible item.
      if (itemList.length > 0) {
        // Creating a dedicated variable makes the parser happier.
        const scheduleItem = itemList[itemList.length - 1];
        if (!scheduleItem.startTime || !scheduleItem.timeZoneID) {
          return itemList.length - 1;
        }
        const lastItemStartDayTime = calcCruiseDayTime(parseISO(scheduleItem.startTime), startDate, endDate);
        const lastItemTzOffset = getTimeZoneOffset(
          appConfig.portTimeZoneID,
          scheduleItem.timeZoneID,
          scheduleItem.startTime,
        );
        if (
          nowDayTime.cruiseDay === lastItemStartDayTime.cruiseDay &&
          nowDayTime.dayMinutes - lastItemTzOffset >= lastItemStartDayTime.dayMinutes
        ) {
          return itemList.length - 1;
        }
      }
      // List of zero or any other situation, just return 0 (start of list);
      return 0;
    },
    [appConfig.portTimeZoneID, endDate, startDate],
  );




  return (
    <View style={commonStyles.flex}>
      <EventFlatList
        listRef={listRef}
        scheduleItems={scheduleList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
        setRefreshing={setRefreshing}
      />
    </View>
  );
};
