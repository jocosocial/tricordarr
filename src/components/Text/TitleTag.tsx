import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleProp, TextStyle} from 'react-native';

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
