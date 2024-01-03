import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {LoginFormValues} from '../../libraries/Types/FormValues';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {PasswordValidation, UsernameValidation} from '../../libraries/ValidationSchema';
import {useAppTheme} from '../../styles/Theme';
import {useRootStack} from '../Navigation/Stacks/RootStackNavigator';
import {RootStackComponents} from '../../libraries/Enums/Navigation';

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
  const theme = useAppTheme();
  const rootNavigation = useRootStack();

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
          <TextField
            viewStyle={styles.inputContainer}
            name={'password'}
            label={'Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <PrimaryActionButton
            disabled={!values.username || !values.password || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Login'}
          />
          <PrimaryActionButton
            buttonText={'Forgot Password'}
            onPress={() => rootNavigation.push(RootStackComponents.accountRecoveryScreen)}
            viewStyle={styles.buttonContainer}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </View>
      )}
    </Formik>
  );
};
