import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const PostAsUserBanner = () => {
  const {asPrivilegedUser} = useElevation();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    banner: {
      ...commonStyles.errorContainer,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    text: {
      ...commonStyles.errorContainer,
    },
  });

  if (!asPrivilegedUser) {
    return <></>;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Posting as {asPrivilegedUser}</Text>
    </View>
  );
};
