import React, {PropsWithChildren} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {View} from 'react-native';

export const MessageAvatarContainerView = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  const style = [commonStyles.marginRightSmall, commonStyles.flexColumn, commonStyles.flexEnd];
  return <View style={style}>{children}</View>;
};
