import {Text} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {StyleSheet} from 'react-native';

export const LfgCanceledView = ({update}: {update?: boolean}) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.error,
      ...commonStyles.flexRow,
      ...commonStyles.paddingVertical,
    },
    innerContainer: {
      ...commonStyles.alignItemsCenter,
      ...commonStyles.flex,
    },
    text: {
      ...commonStyles.onError,
      ...commonStyles.bold,
    },
  });
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.text}>This LFG has been cancelled.</Text>
        {update && <Text style={styles.text}>Saving it will un-cancel it.</Text>}
      </View>
    </View>
  );
};
