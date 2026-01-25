import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface ScheduleHeaderButtonProps {
  isSelected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  primaryText: string;
  secondaryText: string;
  underlinePrimary?: boolean;
}

/**
 * Shared base component for schedule header buttons (day buttons and "All Days" button).
 */
export const ScheduleHeaderButton = (props: ScheduleHeaderButtonProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    view: {
      backgroundColor: props.isSelected ? theme.colors.inverseSurface : theme.colors.inverseOnSurface,
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingVerticalSmall,
      minWidth: 68, // Approximate height to make button square-ish
    },
    primaryText: {
      ...commonStyles.bold,
      ...(props.underlinePrimary ? commonStyles.underline : undefined),
      color: props.isSelected ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
    },
    secondaryText: {
      color: props.isSelected ? theme.colors.inverseOnSurface : theme.colors.inverseSurface,
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
        <Text style={styles.primaryText} variant={'titleLarge'}>
          {props.primaryText}
        </Text>
        <Text style={styles.secondaryText} variant={'bodyMedium'}>
          {props.secondaryText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
