import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {PasswordValidation, UsernameValidation} from '#src/Libraries/ValidationSchema';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
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
          <TextField
            viewStyle={styles.inputContainer}
            name={'username'}
            label={'Username'}
            left={<TextInput.Icon icon={AppIcons.user} />}
            autoCapitalize={'none'}
          />
          <SecureTextField name={'password'} label={'Password'} />
          <PrimaryActionButton
            disabled={!values.username || !values.password || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Login'}
          />
          <PrimaryActionButton
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
