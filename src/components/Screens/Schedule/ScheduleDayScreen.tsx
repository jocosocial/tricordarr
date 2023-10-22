import React, {useCallback, useEffect} from 'react';
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

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleDayScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleDayScreen = ({navigation}: Props) => {
  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Cruise Day'} iconName={AppIcons.cruiseDay} onPress={() => console.log('hi')} />
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
      </ScrollingContentView>
    </AppView>
  );
};
