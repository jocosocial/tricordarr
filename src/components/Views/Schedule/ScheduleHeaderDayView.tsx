import {CruiseDayData} from '../../../libraries/Types';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {format} from 'date-fns';
import {Text} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme.ts';
import {useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator.tsx';
import {EventStackComponents} from '../../../libraries/Enums/Navigation.ts';

interface ScheduleHeaderDayViewProps {
  cruiseDay: CruiseDayData;
  isToday?: boolean;
}

export const ScheduleHeaderDayView = (props: ScheduleHeaderDayViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const navigation = useEventStackNavigation();
  const styles = StyleSheet.create({
    view: {
      backgroundColor: props.isToday ? theme.colors.inverseSurface : theme.colors.inverseOnSurface,
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalSmall,
    },
    dayText: {
      ...commonStyles.bold,
      // ...commonStyles.onTwitarrButton,
      color: props.isToday ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
    },
    dateText: {
      // ...commonStyles.onTwitarrButton,
      color: props.isToday ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
    },
  });
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.replace(EventStackComponents.eventDayScreen, {
          cruiseDay: props.cruiseDay.cruiseDay,
        })
      }>
      <View style={styles.view}>
        <Text style={styles.dayText} variant={'titleLarge'}>
          {format(props.cruiseDay.date, 'EEE')}
        </Text>
        <Text style={styles.dateText} variant={'bodyLarge'}>
          {format(props.cruiseDay.date, 'MMM dd')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
