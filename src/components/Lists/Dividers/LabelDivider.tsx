import React from 'react';
import {Divider, Text} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {ColorValue, StyleProp, View, ViewStyle} from 'react-native';
import {commonStyles} from '../../../styles';

interface LabelDividerProps {
  label?: string;
  color?: ColorValue;
  wrapperStyle?: StyleProp<ViewStyle>;
  dividerColor?: ColorValue;
}

export const LabelDivider = ({label = 'New', color = undefined, wrapperStyle, dividerColor}: LabelDividerProps) => {
  const theme = useAppTheme();
  const styles = {
    wrapper: {
      // Changing these to Smalls for the ForumPostFlatList use case.
      ...commonStyles.marginTopSmall,
      ...commonStyles.marginBottomSmall,
    },
    container: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
    },
    divider: {
      backgroundColor: dividerColor ? dividerColor : theme.colors.error,
      ...commonStyles.fullWidth,
    },
    text: {
      color: color ? color : theme.colors.error,
    },
  };
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
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
