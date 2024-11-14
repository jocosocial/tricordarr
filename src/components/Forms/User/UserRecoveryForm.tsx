import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {UserRegistrationFormValues} from '../../../libraries/Types/FormValues.ts';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import * as Yup from 'yup';
import {TextField} from '../Fields/TextField.tsx';
import {
  AccountRecoveryValidation,
  PasswordValidation,
  UsernameValidation,
} from '../../../libraries/ValidationSchema.ts';
import {SecureTextField} from '../Fields/SecureTextField.tsx';

interface UserCreateFormProps {
  onSubmit: (values: UserRegistrationFormValues, helpers: FormikHelpers<UserRegistrationFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  verification: AccountRecoveryValidation,
  username: UsernameValidation,
  password: PasswordValidation,
  passwordVerify: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match.'),
});

const initialValues: UserRegistrationFormValues = {
  username: '',
  password: '',
  passwordVerify: '',
  verification: '',
};

// https://formik.org/docs/guides/react-native
export const UserRecoveryForm = ({onSubmit}: UserCreateFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'verification'}
            label={'Verification'}
            left={<TextInput.Icon icon={AppIcons.registrationCode} />}
            autoCapitalize={'none'}
            infoText={
              'Can be one of: Registration Code (mailed to you before the cruise), Recovery Key (displayed when you created your account), Current Password.'
            }
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'username'}
            label={'Username'}
            left={<TextInput.Icon icon={AppIcons.user} />}
            autoCapitalize={'none'}
          />
          <SecureTextField name={'password'} label={'New Password'} />
          <SecureTextField name={'passwordVerify'} label={'Verify Password'} />
          <PrimaryActionButton
            disabled={
              !values.username ||
              !values.password ||
              !values.passwordVerify ||
              !values.verification ||
              !isValid ||
              isSubmitting
            }
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Reset'}
          />
        </View>
      )}
    </Formik>
  );
};
