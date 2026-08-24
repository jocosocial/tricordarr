import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField';
import {UsernameTextField} from '#src/Components/Forms/Fields/UsernameTextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {PasswordValidation, UsernameValidation} from '#src/Libraries/ValidationSchema';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LoginFormValues} from '#src/Types/FormValues';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues, helpers: FormikHelpers<LoginFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  username: UsernameValidation,
  password: PasswordValidation,
});

const initialValues: LoginFormValues = {
  username: '',
  password: '',
};

// https://formik.org/docs/guides/react-native
export const LoginForm = ({onSubmit}: LoginFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall, commonStyles.marginBottom],
  };
  const {theme} = useAppTheme();
  const commonNavigation = useCommonStack();

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting}) => (
        <View>
          <UsernameTextField
            viewStyle={styles.inputContainer}
            testID={'loginUsername-input'}
            showErrorWithoutTouch={false}
          />
          <SecureTextField
            name={'password'}
            testID={'loginPassword-input'}
            label={'Password'}
            textContentType={'password'}
            autoComplete={'password'}
            showErrorWithoutTouch={false}
          />
          <PrimaryActionButton
            disabled={!values.username || !values.password || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Login'}
            testID={'loginSubmit-button'}
          />
          <PrimaryActionButton
            testID={'loginForgotPassword-button'}
            buttonText={'Forgot Password'}
            onPress={() => commonNavigation.push(CommonStackComponents.accountRecoveryScreen)}
            viewStyle={styles.buttonContainer}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </View>
      )}
    </Formik>
  );
};
