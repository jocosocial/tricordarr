import {Switch, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface SettingSwitchProps {
  title: string;
  value: boolean;
  onPress: () => void;
}

export const SettingSwitch = ({title, value, onPress}: SettingSwitchProps) => {
  const {commonStyles} = useStyles();
  return (
    <TouchableRipple style={commonStyles.marginTop} onPress={onPress}>
      <View style={commonStyles.booleanSettingRowView}>
        <Text>{title}</Text>
        <Switch value={value} onValueChange={onPress} />
      </View>
    </TouchableRipple>
  );
};
