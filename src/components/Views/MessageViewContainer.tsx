import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export const MessageViewContainer = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={[commonStyles.flex]}>{children}</View>;
};
