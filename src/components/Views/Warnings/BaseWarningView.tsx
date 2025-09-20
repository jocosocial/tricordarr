import {Text} from 'react-native-paper';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';

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
