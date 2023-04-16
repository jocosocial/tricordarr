import React from 'react';
import {Divider, Text} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {ColorValue, View} from 'react-native';
import {commonStyles} from '../../../styles';

interface LabelDividerProps {
  label?: string;
  color?: ColorValue;
}

export const LabelDivider = ({label = 'New', color = undefined}: LabelDividerProps) => {
  const theme = useAppTheme();
  const styles = {
    wrapper: {
      ...commonStyles.marginTop,
    },
    container: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
    },
    divider: {
      backgroundColor: color ? color : theme.colors.error,
      ...commonStyles.fullWidth,
    },
    text: {
      color: color ? color : theme.colors.error,
    },
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Divider horizontalInset={true} bold={true} style={styles.divider} />
      </View>
      <View style={styles.container}>
        <Text style={styles.text} variant={'labelMedium'}>
          {label}
        </Text>
      </View>
    </View>
  );
};
