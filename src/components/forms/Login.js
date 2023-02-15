import React from 'react';
import {Button, View} from 'react-native';
import {Formik} from 'formik';
import {TextInput} from 'react-native-paper';

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
          <Button onPress={handleSubmit} title={'Login'} />
        </View>
      )}
    </Formik>
  );
};