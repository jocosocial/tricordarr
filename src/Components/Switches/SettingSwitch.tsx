import React from 'react';
import {StyleProp, StyleSheet, Switch, View, ViewStyle} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface SettingSwitchProps {
  title: string;
  value: boolean;
  onPress: () => void;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * @deprecated Use the BooleanField component instead.
 */
export const SettingSwitch = ({title, value, onPress, description, disabled, style}: SettingSwitchProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    wrapper: {
      ...commonStyles.marginTop,
      ...commonStyles.paddingHorizontal,
      ...(style as ViewStyle),
    },
    inner: {
      ...commonStyles.booleanSettingRowView,
    },
  });

  return (
    <TouchableRipple style={styles.wrapper} onPress={onPress} disabled={disabled}>
      <View>
        <View style={styles.inner}>
          <Text>{title}</Text>
          <Switch value={value} onValueChange={onPress} disabled={disabled} />
        </View>
        {description && <Text variant={'bodyMedium'}>{description}</Text>}
      </View>
    </TouchableRipple>
  );
};
