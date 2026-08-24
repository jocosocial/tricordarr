import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UsernameTextField} from '#src/Components/Forms/Fields/UsernameTextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {PasswordValidation, RecoveryKeyValidation, UsernameValidation} from '#src/Libraries/ValidationSchema';
import {UserRegistrationFormValues} from '#src/Types/FormValues';

interface UserCreateFormProps {
  onSubmit: (values: UserRegistrationFormValues, helpers: FormikHelpers<UserRegistrationFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  // This is 7 for the space that often comes with a copy+paste from the emails.
  verification: RecoveryKeyValidation,
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
export const UserCreateForm = ({onSubmit}: UserCreateFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            viewStyle={styles.inputContainer}
            name={'verification'}
            testID={'registerVerification-input'}
            label={'Registration Code'}
            left={<TextInput.Icon icon={AppIcons.registrationCode} />}
            autoCapitalize={'characters'}
            autoCorrect={false}
            spellCheck={false}
            maxLength={7}
            textContentType={'oneTimeCode'}
            autoComplete={'off'}
            showErrorWithoutTouch={false}
          />
          <UsernameTextField
            viewStyle={styles.inputContainer}
            testID={'registerUsername-input'}
            showErrorWithoutTouch={false}
          />
          <SecureTextField
            name={'password'}
            testID={'registerPassword-input'}
            label={'Password'}
            textContentType={'newPassword'}
            autoComplete={'password-new'}
            showErrorWithoutTouch={false}
          />
          <SecureTextField
            name={'passwordVerify'}
            testID={'registerPasswordVerify-input'}
            label={'Verify Password'}
            textContentType={'newPassword'}
            autoComplete={'password-new'}
            showErrorWithoutTouch={false}
          />
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
            buttonText={'Create'}
            testID={'registerSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
