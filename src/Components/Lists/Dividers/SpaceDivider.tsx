import React from 'react';
import {View} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

// @TODO deprecate this
export const SpaceDivider = () => {
  const {commonStyles} = useStyles();
  return <View style={commonStyles.marginTopSmall} />;
};
