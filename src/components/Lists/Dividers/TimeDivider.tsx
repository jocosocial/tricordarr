import React from 'react';
import {Divider, Text} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {ColorValue, View} from 'react-native';
import {commonStyles} from '../../../styles';

interface LabelDividerProps {
  label?: string;
  color?: ColorValue;
}

export const TimeDivider = ({label = 'ASD'}: LabelDividerProps) => {
  const theme = useAppTheme();
  const styles = {
    wrapper: {
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.alignItemsCenter,
    },
    container: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
    },
    divider: {
      ...commonStyles.fullWidth,
      backgroundColor: theme.colors.onBackground,
      // flex: 1,
    },
    text: {
      ...commonStyles.bold,
    },
    textWrapper: {
      ...commonStyles.marginRightSmall,
    },
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.textWrapper}>
        <Text style={styles.text} variant={'bodyLarge'}>
          {label}
        </Text>
      </View>
      <Divider horizontalInset={false} bold={true} style={styles.divider} />
    </View>
  );
};
