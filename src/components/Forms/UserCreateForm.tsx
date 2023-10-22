import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {Text, TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {UserRegistrationFormValues} from '../../libraries/Types/FormValues';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';

interface UserCreateFormProps {
  onSubmit: (values: UserRegistrationFormValues, helpers: FormikHelpers<UserRegistrationFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  // This is 7 for the space that often comes with a copy+paste from the emails.
  verification: Yup.string().min(6).max(7).required('Six-character registration code is required.'),
  username: Yup.string().required('Username cannot be empty.'),
  password: Yup.string().min(6).max(50).required('Password cannot be empty.'),
  passwordVerify: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match.'),
});

const initialValues: UserRegistrationFormValues = {
  username: '',
  password: '',
  passwordVerify: '',
  verification: '',
};

// https://formik.org/docs/guides/react-native
export const UserCreateForm = ({onSubmit}: UserCreateFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting}) => (
        <View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'verification'}
            label={'Registration Code'}
            left={<TextInput.Icon icon={AppIcons.registrationCode} />}
            autoCapitalize={'characters'}
            maxLength={7}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'username'}
            label={'Username'}
            left={<TextInput.Icon icon={AppIcons.user} />}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'password'}
            label={'Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'passwordVerify'}
            label={'Confirm Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <PrimaryActionButton
            disabled={
              !values.username || !values.password || !values.passwordVerify || !values.verification || isSubmitting
            }
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Create'}
          />
        </View>
      )}
    </Formik>
  );
};
