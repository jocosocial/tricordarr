import React from 'react';
import {View} from 'react-native';
import {Formik} from 'formik';
import {TextInput} from 'react-native-paper';
import {SaveButton} from '../Buttons/SaveButton';

// https://formik.org/docs/guides/react-native
export const LoginForm = ({onSubmit = () => {}, initialValues = {}}) => {
  return (
    <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <TextInput
            label={'Username'}
            left={<TextInput.Icon icon="account" />}
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            name={'username'}
          />
          <TextInput
            label={'Password'}
            left={<TextInput.Icon icon="form-textbox-password" />}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            mode={'outlined'}
            secureTextEntry={true}
          />
          <SaveButton onPress={handleSubmit} buttonText={'Login'} />
        </View>
      )}
    </Formik>
  );
};
