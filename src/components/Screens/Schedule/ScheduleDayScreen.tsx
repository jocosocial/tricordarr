import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {Divider, Text} from 'react-native-paper';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {getDay} from 'date-fns';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

// This determines the "virtual day of the cruise" that we are currently on. For example, lets say
// that
/*
  Determine the "virtual day index of the cruise". For example: Let's say today is Sunday Oct 22 2023, long after
  the actual 2023 cruise. We want to simulate that today is actually the "1st day of the cruise" (cruiseday=1).
  https://github.com/jocosocial/swiftarr/blob/70d83bc65e1a70557e6eb12ed941ea01973aca27/Sources/App/Site/SiteEventsController.swift#L144-L149
 */
const getCruiseDay: () => number = () => {
  // Get today's date.
  const today = new Date();
  // Map the day of the week to a number.
  const weekday = getDay(today);
  console.log('weekday', weekday);
  // What day index does the cruise start on?
  const cruiseStartDayOfWeek = 0; // Sunday is 0 in JavaScript date-fns, 1 in Swift.
  // Do maths. We add an extra 1 to the weekday and cruiseStartDayOfWeek because Swift and JavaScript assign values differently.
  return ((7 + (weekday + 1) - (cruiseStartDayOfWeek + 1)) % 7) + 1;
};

export const ScheduleDayScreen = ({navigation, route}: Props) => {
  const [cruiseDay, setCruiseDay] = useState(route.params?.cruiseDay || getCruiseDay());
  const {data: eventData, refetch} = useEventsQuery({cruiseDay: cruiseDay});
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleCruiseDayMenu cruiseDay={cruiseDay} setCruiseDay={setCruiseDay} />
          <Item title={'Search'} iconName={AppIcons.search} onPress={() => console.log('hi')} />
          <Item title={'Filter'} iconName={AppIcons.filter} onPress={() => console.log('hi')} />
          <Item title={'Menu'} iconName={AppIcons.menu} onPress={() => console.log('hi')} />
        </HeaderButtons>
      </View>
    );
  }, [cruiseDay]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  console.log('Cruise day is ', cruiseDay);
  useEffect(() => {
    refetch();
  }, [cruiseDay, refetch]);

  return (
    <AppView>
      <ScrollingContentView>
        <Divider bold={true} />
        <Text variant={'titleLarge'}>09:00AM</Text>
        <ScheduleEventCard />
        <Divider bold={true} />
        <Text variant={'titleLarge'}>10:00AM</Text>
        <ScheduleEventCard />
        <Divider bold={true} />
        <Text variant={'titleLarge'}>11:00AM</Text>
        <ScheduleEventCard />
        {eventData && eventData.map(event => <Text key={event.eventID}>{event.title}</Text>)}
      </ScrollingContentView>
    </AppView>
  );
};
