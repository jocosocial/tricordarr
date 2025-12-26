import React from 'react';
import {StyleSheet, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface Props {
  title: string;
  message: string;
  headerStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}
export const BaseWarningView = (props: Props) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNeutral,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={styles.headerView}
      onLongPress={props.onLongPress}
      onPress={props.onPress}>
      <Text style={styles.headerText}>{props.title}</Text>
      <Text variant={'labelMedium'} style={commonStyles.onTwitarrButton}>
        {props.message}
      </Text>
    </TouchableOpacity>
  );
};
