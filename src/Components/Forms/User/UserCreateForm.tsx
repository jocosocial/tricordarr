import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {Checkbox, Text, TextInput, TouchableRipple} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UsernameTextField} from '#src/Components/Forms/Fields/UsernameTextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {PasswordValidation, RecoveryKeyValidation, UsernameValidation} from '#src/Libraries/ValidationSchema';
import {UserCreateFormValues} from '#src/Types/FormValues';

interface UserCreateFormProps {
  onConductPress: () => void;
  onSubmit: (values: UserCreateFormValues, helpers: FormikHelpers<UserCreateFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  // This is 7 for the space that often comes with a copy+paste from the emails.
  verification: RecoveryKeyValidation,
  username: UsernameValidation,
  password: PasswordValidation,
  passwordVerify: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match.'),
  agreedToConduct: Yup.boolean().oneOf([true]),
});

const initialValues: UserCreateFormValues = {
  username: '',
  password: '',
  passwordVerify: '',
  verification: '',
  agreedToConduct: false,
};

// https://formik.org/docs/guides/react-native
export const UserCreateForm = ({onSubmit, onConductPress}: UserCreateFormProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {theme} = useAppTheme();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
    // Bleeds out to the screen edges (undoing RegisterScreen's PaddedContentView) so the tap target is full width.
    consentRow: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.marginTopSmall,
      ...commonStyles.paddingHorizontalSmall,
      marginHorizontal: -styleDefaults.marginSize / 2,
    },
    consentText: commonStyles.flex,
    consentLink: {color: theme.colors.twitarrNeutralButton, textDecorationLine: 'underline' as const},
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid, setFieldValue}) => (
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
          <TouchableRipple
            testID={'registerConduct-checkbox'}
            style={styles.consentRow}
            accessibilityRole={'checkbox'}
            accessibilityState={{checked: values.agreedToConduct}}
            onPress={() => setFieldValue('agreedToConduct', !values.agreedToConduct)}>
            <>
              <Checkbox.Android status={values.agreedToConduct ? 'checked' : 'unchecked'} />
              <Text style={styles.consentText}>
                I have read and agree to the Twit-arr Guidelines, the JoCo Cruise Code of Conduct, and the{' '}
                <Text style={styles.consentLink} onPress={onConductPress} testID={'registerConduct-link'}>
                  Twit-arr Code of Conduct
                </Text>
                .
              </Text>
            </>
          </TouchableRipple>
          <PrimaryActionButton
            disabled={
              !values.agreedToConduct ||
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
