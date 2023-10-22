import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {ChangePasswordFormValues} from '../../libraries/Types/FormValues';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {PasswordValidation} from '../../libraries/ValidationSchema';

interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordFormValues, helpers: FormikHelpers<ChangePasswordFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Must provide current password.'),
  newPassword: PasswordValidation,
  newPasswordVerify: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match.'),
});

const initialValues: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  newPasswordVerify: '',
};

// https://formik.org/docs/guides/react-native
export const ChangePasswordForm = ({onSubmit}: ChangePasswordFormProps) => {
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
            name={'currentPassword'}
            label={'Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'newPassword'}
            label={'New Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'newPasswordVerify'}
            label={'Verify Password'}
            left={<TextInput.Icon icon={AppIcons.password} />}
            secureTextEntry={true}
          />
          <PrimaryActionButton
            disabled={!values.currentPassword || !values.newPassword || !values.newPasswordVerify || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Change Password'}
          />
        </View>
      )}
    </Formik>
  );
};
