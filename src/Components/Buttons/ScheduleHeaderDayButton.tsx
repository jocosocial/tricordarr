import {format} from 'date-fns';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {CruiseDayData} from '#src/Types';

interface ScheduleHeaderDayViewProps {
  cruiseDay: CruiseDayData;
  isSelectedDay?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const ScheduleHeaderDayButton = (props: ScheduleHeaderDayViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {adjustedCruiseDayToday} = useCruise();
  const isToday = props.cruiseDay.cruiseDay === adjustedCruiseDayToday;

  const styles = StyleSheet.create({
    view: {
      backgroundColor: props.isSelectedDay ? theme.colors.inverseSurface : theme.colors.inverseOnSurface,
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalSmall,
    },
    dayText: {
      ...commonStyles.bold,
      ...(isToday ? commonStyles.underline : undefined),
      color: props.isSelectedDay ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
    },
    dateText: {
      color: props.isSelectedDay ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
    },
    buttonContainer: {
      ...commonStyles.paddingHorizontalTiny,
    },
  });

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={props.onPress}
      disabled={props.disabled}
      activeOpacity={1}>
      <View style={styles.view}>
        <Text style={styles.dayText} variant={'titleLarge'}>
          {format(props.cruiseDay.date, 'EEE')}
        </Text>
        <Text style={styles.dateText} variant={'bodyMedium'}>
          {format(props.cruiseDay.date, 'MMM dd')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
