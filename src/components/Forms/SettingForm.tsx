import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import {SaveButton} from '../Buttons/SaveButton';

interface SettingFormProps {
  value: string;
  onSave: () => void | Promise<any>;
}

// This was the old code for doing boolean, but never fully implemented.
// Should probably do something about it.
// <TouchableRipple onPress={() => setValue(!value)}>
//         <View style={styles.row}>
//           <Text>Enable</Text>
//           <Switch value={value} onValueChange={() => setValue(!value)} />
//         </View>
//       </TouchableRipple>
//       <SaveButton onPress={onSave} />

export const SettingForm = ({value, onSave}: SettingFormProps) => {
  return (
    <Formik enableReinitialize initialValues={{settingValue: value}} onSubmit={onSave}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <TextInput
            label={'Value'}
            onChangeText={handleChange('settingValue')}
            onBlur={handleBlur('settingValue')}
            value={values.settingValue}
          />
          <SaveButton onPress={handleSubmit} buttonText={'Save'} />
        </View>
      )}
    </Formik>
  );
};
