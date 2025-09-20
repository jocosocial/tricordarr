import React from 'react';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface Props {
  title: string;
  message: string;
  headerStyle?: ViewStyle;
  textStyle?: TextStyle;
}
export const BaseWarningView = (props: Props) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNeutral,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
      ...props.headerStyle,
    },
    headerText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
      ...props.textStyle,
    },
  });

  return (
    <View style={styles.headerView}>
      <Text style={styles.headerText}>{props.title}</Text>
      <Text variant={'labelSmall'} style={commonStyles.onTwitarrButton}>
        {props.message}
      </Text>
    </View>
  );
};
