import {AppView} from '../../../Views/AppView';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EventStackParamList} from '../../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {ScheduleDayHeaderView} from '../../../Views/Schedule/ScheduleDayHeaderView';

export type Props = NativeStackScreenProps<
  EventStackParamList,
  EventStackComponents.eventFavoritesScreen,
  NavigatorIDs.eventStack
>;

export const EventFavoritesScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();

  // Trying .navigate() to avoid some performance issues with keeping past pages around.
  const navigatePreviousDay = () =>
    navigation.navigate(EventStackComponents.eventFavoritesScreen, {
      cruiseDay: route.params.cruiseDay - 1,
    });
  const navigateNextDay = () =>
    navigation.navigate(EventStackComponents.eventFavoritesScreen, {
      cruiseDay: route.params.cruiseDay + 1,
    });

  return (
    <AppView>
      <View style={commonStyles.flex}>
        <ScheduleDayHeaderView
          selectedCruiseDay={route.params.cruiseDay}
          navigatePreviousDay={navigatePreviousDay}
          navigateNextDay={navigateNextDay}
        />
      </View>
    </AppView>
  );
};
