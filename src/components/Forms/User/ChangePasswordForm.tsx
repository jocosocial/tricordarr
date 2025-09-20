import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {ChangePasswordFormValues} from '#src/Libraries/Types/FormValues.ts';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import * as Yup from 'yup';
import {PasswordValidation} from '#src/Libraries/ValidationSchema.ts';
import {SecureTextField} from '#src/Components/Forms/Fields/SecureTextField.tsx';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';

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
          <DirtyDetectionField />
          <SecureTextField name={'currentPassword'} label={'Password'} />
          <SecureTextField name={'newPassword'} label={'New Password'} />
          <SecureTextField name={'newPasswordVerify'} label={'Verify Password'} />
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
