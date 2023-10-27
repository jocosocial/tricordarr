import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {TextStyle, View} from 'react-native';
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
import {Text} from 'react-native-paper';
import {format} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import GestureRecognizer from 'react-native-swipe-gestures';
import {LoadingView} from '../../Views/Static/LoadingView';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleDayScreen = ({navigation}: Props) => {
  const {cruiseDay, cruiseDays, setCruiseDay, cruiseLength} = useCruise();
  const {data: eventData, isLoading} = useEventsQuery({cruiseDay: cruiseDay});
  const {commonStyles} = useStyles();

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

  const headerTextStyle: TextStyle = {
    ...commonStyles.paddingVerticalSmall,
    ...commonStyles.paddingHorizontal,
    ...commonStyles.bold,
  };

  console.log(cruiseDay);

  const onSwipeLeft = () => {
    console.log('LEFT');
    if (cruiseDay < cruiseLength) {
      setCruiseDay(cruiseDay + 1);
    }
  };

  const onSwipeRight = () => {
    console.log('RIGHT');
    if (cruiseDay > 1) {
      setCruiseDay(cruiseDay - 1);
    }
  };

  return (
    <AppView>
      <GestureRecognizer onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}>
        <View>
          <Text style={headerTextStyle}>{format(cruiseDays[cruiseDay - 1].date, 'eeee LLLL do')}</Text>
        </View>
        <View>
          {isLoading && <LoadingView />}
          {!isLoading && eventData && <EventFlatList eventList={eventData} />}
        </View>
      </GestureRecognizer>
    </AppView>
  );
};
