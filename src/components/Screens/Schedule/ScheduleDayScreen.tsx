import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {StyleSheet, TextStyle, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
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
import {format} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleDayScreen = ({navigation, route}: Props) => {
  const {data: eventData, isLoading} = useEventsQuery({cruiseDay: route.params.cruiseDay});
  const {commonStyles} = useStyles();
  const {cruiseDays, cruiseDayToday, cruiseLength} = useCruise();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ScheduleCruiseDayMenu />
          <Item title={'Search'} iconName={AppIcons.search} onPress={() => console.log('hi')} />
          <Item title={'Filter'} iconName={AppIcons.filter} onPress={() => console.log('hi')} />
          <Item title={'Menu'} iconName={AppIcons.menu} onPress={() => console.log('hi')} />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);


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
    navigation.navigate(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: route.params.cruiseDay - 1});
  const navigateNextDay = () =>
    navigation.navigate(ScheduleStackComponents.scheduleDayScreen, {cruiseDay: route.params.cruiseDay + 1});

  const onSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // console.log('translationX: ', event.nativeEvent.translationX);
      // console.log('translationY: ', event.nativeEvent.translationY);
      // console.log('velocityX: ', event.nativeEvent.velocityY);
      // console.log('velocityY: ', event.nativeEvent.velocityY);

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

  return (
    <AppView>
      <PanGestureHandler onHandlerStateChange={onSwipe}>
        <View>
          <View style={styles.headerView}>
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
          <View>
            <View>
              {isLoading && <LoadingView />}
              {!isLoading && eventData && <EventFlatList eventList={eventData} />}
            </View>
          </View>
        </View>
      </PanGestureHandler>
    </AppView>
  );
};
