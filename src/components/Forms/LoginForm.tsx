import React from 'react';
import {View} from 'react-native';
import {Formik} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {LoginFormValues} from '../../libraries/Types/FormValues';
import {AppIcons} from '../../libraries/Enums/Icons';

interface LoginFormProps {
  onSubmit: any;
  initialValues?: LoginFormValues;
}

// https://formik.org/docs/guides/react-native
export const LoginForm = ({onSubmit, initialValues = {}}: LoginFormProps) => {
  return (
    <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
      {({handleChange, handleBlur, handleSubmit, values}) => (
        <View>
          <TextInput
            label={'Username'}
            left={<TextInput.Icon icon={AppIcons.user} />}
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
          />
          <TextInput
            label={'Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            mode={'outlined'}
            secureTextEntry={true}
          />
          <PrimaryActionButton onPress={handleSubmit} buttonText={'Login'} />
        </View>
      )}
    </Formik>
  );
};
