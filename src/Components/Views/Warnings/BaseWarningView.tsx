import React from 'react';
import {StyleSheet, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface Props {
  title: string;
  message: string;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  disabled?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  messageStyle?: TextStyle;
}
export const BaseWarningView = (props: Props) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNeutral,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
      ...props.headerStyle,
    },
    titleText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
      ...props.titleStyle,
    },
    messageText: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.textCenter,
      ...props.messageStyle,
    },
  });

  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={styles.headerView}
      onLongPress={props.onLongPress}
      onPress={props.onPress}>
      <Text style={styles.titleText}>{props.title}</Text>
      <Text variant={'labelMedium'} style={styles.messageText}>
        {props.message}
      </Text>
    </TouchableOpacity>
  );
};
