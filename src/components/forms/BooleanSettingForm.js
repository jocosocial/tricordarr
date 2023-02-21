import React from 'react';
import {Switch, Text, TouchableRipple} from 'react-native-paper';
import {SaveButton} from '../Buttons/SaveButton';
import {StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    // paddingHorizontal: 20,
  },
});

// @TODO make this do things with Formik.
export const BooleanSettingForm = ({value, setValue, onSave}) => {
  return (
    <View>
      <TouchableRipple onPress={() => setValue(!value)}>
        <View style={styles.row}>
          <Text>Enable</Text>
          <Switch value={value} onValueChange={() => setValue(!value)} />
        </View>
      </TouchableRipple>
      <SaveButton onPress={onSave} />
    </View>
  );
};
