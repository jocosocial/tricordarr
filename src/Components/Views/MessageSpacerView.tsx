import React from 'react';
import {View} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const MessageSpacerView = () => {
  const {commonStyles} = useStyles();
  const styles = [
    commonStyles.spacerWidth,
    // {backgroundColor: 'red'},
  ];
  return <View style={styles} />;
};
