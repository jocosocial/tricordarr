import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {View} from 'react-native';
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

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleDayScreen = ({navigation}: Props) => {
  const {cruiseDay} = useCruise();
  const {data: eventData} = useEventsQuery({cruiseDay: cruiseDay});
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

  return <AppView>{eventData && <EventFlatList eventList={eventData} />}</AppView>;
};
