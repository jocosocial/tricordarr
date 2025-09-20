import React, {PropsWithChildren} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface TitleTagProps {
  variant?: keyof typeof MD3TypescaleKey;
  style?: StyleProp<TextStyle>;
}
export const TitleTag = ({children, variant = 'titleSmall', style = undefined}: PropsWithChildren<TitleTagProps>) => {
  const {commonStyles} = useStyles();
  return (
    <Text variant={variant} style={style === undefined ? [commonStyles.marginBottomSmall] : style}>
      {children}
    </Text>
  );
};
