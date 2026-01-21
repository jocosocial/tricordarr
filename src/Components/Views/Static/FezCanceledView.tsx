import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';

export const FezCanceledView = ({fezType, update}: {fezType: FezType; update?: boolean}) => {
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
        <Text style={styles.text}>This {FezType.getChatTypeString(fezType)} has been cancelled.</Text>
        {update && <Text style={styles.text}>Saving it will un-cancel it.</Text>}
      </View>
    </View>
  );
};
