import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {StyleSheet, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {FlatList} from 'react-native-gesture-handler';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleCruiseDayMenu} from '../../Menus/ScheduleCruiseDayMenu';
import {useEventsQuery} from '../../Queries/Events/EventQueries';
import {EventFlatList} from '../../Lists/Schedule/EventFlatList';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {IconButton, Text} from 'react-native-paper';
import {format, parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {ScheduleFAB} from '../../Buttons/FloatingActionButtons/ScheduleFAB';
import {ScheduleItem} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import useDateTime, {calcCruiseDayTime, getTimeZoneOffset} from '../../../libraries/DateTime';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleDayScreen = ({navigation, route}: Props) => {
  const {data: eventData, isLoading: isEventLoading} = useEventsQuery({cruiseDay: route.params.cruiseDay});
  const {data: lfgData, isLoading: isLfgLoading} = useLfgListQuery({cruiseDay: route.params.cruiseDay - 1});
  const {commonStyles} = useStyles();
  const {cruiseDays, cruiseDayToday, cruiseLength, startDate, endDate} = useCruise();
  const listRef = useRef<FlatList<ScheduleItem>>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');

  const buildListData = useCallback(() => {
    console.log('### Building Schedule Item List');
    let itemList: ScheduleItem[] = [];

    let lfgList: FezData[] = [];
    lfgData?.pages.map(page => {
      lfgList = lfgList.concat(page.fezzes);
    });

    eventData?.map(event => {
      itemList.push({
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        timeZone: event.timeZone,
        location: event.location,
        itemType: event.eventType === EventType.shadow ? 'shadow' : 'official',
      });
    });
    lfgList.map(lfg => {
      if (lfg.startTime && lfg.endTime && lfg.timeZone && lfg.location) {
        itemList.push({
          title: lfg.title,
          startTime: lfg.startTime,
          endTime: lfg.endTime,
          timeZone: lfg.timeZone,
          location: lfg.location,
          itemType: 'lfg',
        });
      }
    });

    // ChatGPT for the win
    itemList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
    for (let i = 0; i < itemList.length; i++) {
      const itemStartDayTime = calcCruiseDayTime(parseISO(itemList[i].startTime), startDate, endDate);
      const tzOffset = getTimeZoneOffset('America/New_York', itemList[i].timeZone, itemList[i].startTime);

      if (
        nowDayTime.cruiseDay === itemStartDayTime.cruiseDay &&
        nowDayTime.dayMinutes <= itemStartDayTime.dayMinutes + tzOffset
      ) {
        setScrollNowIndex(i - 1);
        break;
      }
    }

    return itemList;
  }, [endDate, eventData, lfgData?.pages, minutelyUpdatingDate, startDate]);

  const scrollToNow = useCallback(() => {
    if (listRef.current) {
      console.log(
        'Scrolling to index',
        scrollNowIndex,
        'length',
        scheduleItems.length,
        scheduleItems[scrollNowIndex]?.title,
        'at',
        scheduleItems[scrollNowIndex]?.startTime,
      );
      listRef.current.scrollToIndex({
        index: scrollNowIndex,
      });
    } else {
      console.warn('ListRef is undefined, not scrolling.');
    }
  }, [scheduleItems, scrollNowIndex]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleCruiseDayMenu listRef={listRef} scrollToNow={scrollToNow} />
          <Item title={'Search'} iconName={AppIcons.search} onPress={scrollToNow} />
          <Item title={'Filter'} iconName={AppIcons.filter} onPress={() => console.log('hi')} />
          <Item title={'Menu'} iconName={AppIcons.menu} onPress={() => console.log('hi')} />
        </HeaderButtons>
      </View>
    );
  }, [scrollToNow]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    setScheduleItems(buildListData());
  }, [buildListData]);

  const styles = StyleSheet.create({
    headerText: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.bold,
    },
    headerTextContainer: {
      ...commonStyles.flexGrow,
      ...commonStyles.justifyCenter,
    },
    headerView: {
      ...commonStyles.flexRow,
    },
  });

  const navigatePreviousDay = () =>
    navigation.push(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: route.params.cruiseDay - 1});
  const navigateNextDay = () =>
    navigation.push(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: route.params.cruiseDay + 1});

  const onSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (
        (event.nativeEvent.translationX > 50 || event.nativeEvent.velocityX > 500) &&
        Math.abs(event.nativeEvent.translationY) < 80
      ) {
        if (route.params.cruiseDay > 1) {
          navigatePreviousDay();
        }
      } else if (
        (event.nativeEvent.translationX < -50 || event.nativeEvent.velocityX < -500) &&
        Math.abs(event.nativeEvent.translationY) < 80
      ) {
        if (route.params.cruiseDay < cruiseLength) {
          navigateNextDay();
        }
      }
    }
  };

  console.log('Item count', scheduleItems.length, 'Now index', scrollNowIndex);

  if (isLfgLoading || isEventLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {/*<PanGestureHandler onHandlerStateChange={onSwipe}>*/}
      <View style={commonStyles.flex}>
        <View style={{...styles.headerView}}>
          <IconButton icon={AppIcons.back} onPress={navigatePreviousDay} disabled={route.params.cruiseDay === 1} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              {format(cruiseDays[route.params.cruiseDay - 1].date, 'eeee LLLL do')}
              {cruiseDayToday === route.params.cruiseDay ? ' (Today)' : ''}
            </Text>
          </View>
          <IconButton
            icon={AppIcons.forward}
            onPress={navigateNextDay}
            disabled={route.params.cruiseDay === cruiseLength}
          />
        </View>
        <View style={commonStyles.flex}>
          <EventFlatList listRef={listRef} scheduleItems={scheduleItems} scrollNowIndex={scrollNowIndex} />
        </View>
      </View>
      {/*</PanGestureHandler>*/}
      <ScheduleFAB />
    </AppView>
  );
};
