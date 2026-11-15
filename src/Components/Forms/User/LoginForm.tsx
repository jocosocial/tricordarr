import {Formik, FormikHelpers} from 'formik';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField';
import {UsernameTextField} from '#src/Components/Forms/Fields/UsernameTextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {PasswordValidation, UsernameValidation} from '#src/Libraries/ValidationSchema';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LoginFormValues} from '#src/Types/FormValues';
import {OnboardingMode} from '#src/Types/RouteParams';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues, helpers: FormikHelpers<LoginFormValues>) => void;
  /** Pre-fill the username (signing a revoked or signed-out account back in). */
  initialUsername?: string;
  /**
   * Handed to Forgot Password / Forgot Username so they act on the server this form is logging in
   * to, which is not necessarily the active session's.
   */
  recoveryParams?: {serverUrl?: string; mode?: OnboardingMode};
}

const validationSchema = Yup.object().shape({
  username: UsernameValidation,
  password: PasswordValidation,
});

const initialValues: LoginFormValues = {
  username: '',
  password: '',
};

/**
 * The login form. The button follows the schema itself rather than Formik's `isValid`, which reads
 * true until the first validation run, so a prefilled or short value would not disable it.
 */
// https://formik.org/docs/guides/react-native
export const LoginForm = ({onSubmit, initialUsername = '', recoveryParams}: LoginFormProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const commonNavigation = useCommonStack();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          ...commonStyles.marginTopSmall,
          ...commonStyles.marginBottom,
        },
      }),
    [commonStyles],
  );

  return (
    <Formik
      initialValues={{...initialValues, username: initialUsername}}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting}) => (
        <View>
          <UsernameTextField testID={'loginUsername-input'} showErrorWithoutTouch={false} />
          <SecureTextField
            name={'password'}
            testID={'loginPassword-input'}
            label={'Password'}
            textContentType={'password'}
            autoComplete={'password'}
            showErrorWithoutTouch={false}
          />
          <PrimaryActionButton
            disabled={!validationSchema.isValidSync(values) || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Login'}
            testID={'loginSubmit-button'}
          />
          <PrimaryActionButton
            testID={'loginForgotPassword-button'}
            buttonText={'Forgot Password'}
            onPress={() => commonNavigation.push(CommonStackComponents.accountRecoveryScreen, recoveryParams)}
            viewStyle={styles.buttonContainer}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
          <PrimaryActionButton
            testID={'loginForgotUsername-button'}
            buttonText={'Forgot Username'}
            onPress={() => commonNavigation.push(CommonStackComponents.usernameLookupScreen, recoveryParams)}
            viewStyle={styles.buttonContainer}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </View>
      )}
    </Formik>
  );
};
