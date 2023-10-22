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
  verification: Yup.string().min(6).max(6).required('Six-character registration code is required.'),
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
          <Text>
            Your Twitarr registration code was sent to you via e-mail. If you did not receive your registration code or
            do not have access to your e-mail, go to the JoCo Cruise Info Desk for assistance. Your registration code
            can only be used once. Do not share it with others. You will be held accountable for the actions of ANYONE
            using your code. If you need an additional code to create an additional account, please request one at the
            JoCo Cruise Info Desk.
          </Text>
          <TextField
            viewStyle={styles.inputContainer}
            name={'verification'}
            label={'Registration Code'}
            left={<TextInput.Icon icon={AppIcons.registrationCode} />}
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
