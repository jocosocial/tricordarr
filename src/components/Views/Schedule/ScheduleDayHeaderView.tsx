import {IconButton, Text} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons';
import {StyleSheet, View} from 'react-native';
import {format} from 'date-fns';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {useCruise} from '#src/Components/Context/Contexts/CruiseContext';

interface ScheduleDayHeaderViewProps {
  navigatePreviousDay?: () => void;
  navigateNextDay?: () => void;
  selectedCruiseDay: number;
  disableDayButtons?: boolean;
  hideDayButtons?: boolean;
}

export const ScheduleDayHeaderView = ({
  navigatePreviousDay,
  navigateNextDay,
  selectedCruiseDay,
  disableDayButtons,
  hideDayButtons = false,
}: ScheduleDayHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {cruiseDays, adjustedCruiseDayToday, cruiseLength} = useCruise();

  const styles = StyleSheet.create({
    headerText: {
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.bold,
    },
    headerTextContainer: {
      ...commonStyles.flexGrow,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
    headerView: {
      ...commonStyles.flexRow,
      minHeight: 40,
    },
  });

  return (
    <View style={styles.headerView}>
      {!hideDayButtons && (
        <IconButton
          icon={AppIcons.back}
          onPress={navigatePreviousDay}
          disabled={disableDayButtons || selectedCruiseDay === 1}
        />
      )}
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          {format(cruiseDays[selectedCruiseDay - 1].date, 'eeee LLLL do')}
          {adjustedCruiseDayToday === selectedCruiseDay ? ' (Today)' : ''}
        </Text>
      </View>
      {!hideDayButtons && (
        <IconButton
          icon={AppIcons.forward}
          onPress={navigateNextDay}
          disabled={disableDayButtons || selectedCruiseDay === cruiseLength}
        />
      )}
    </View>
  );
};
