import React from 'react';
import {ColorValue, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Divider, Text} from 'react-native-paper';

import {commonStyles} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';

interface LabelDividerProps {
  label?: string;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}

export const TimeDivider = ({label = '', style}: LabelDividerProps) => {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
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
      // This used to be commonStyles.fullWidth. I don't know why I did that and not flex: 1
      // which was commented out. Flex works with the EventFlatList.
      flex: 1,
      backgroundColor: theme.colors.onBackground,
    },
    text: {
      ...commonStyles.bold,
    },
    textWrapper: {
      ...commonStyles.marginRightSmall,
    },
  });
  return (
    <View style={[styles.wrapper, style]}>
      <View style={label ? styles.textWrapper : undefined}>
        <Text style={styles.text} variant={'bodyLarge'}>
          {label}
        </Text>
      </View>
      <Divider horizontalInset={false} bold={true} style={styles.divider} />
    </View>
  );
};
