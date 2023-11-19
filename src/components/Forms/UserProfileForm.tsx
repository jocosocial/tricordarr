import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {UserProfileFormValues, UserRegistrationFormValues} from '../../libraries/Types/FormValues';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {
  EmailValidation,
  PasswordValidation,
  RecoveryKeyValidation, RoomNumberValidation,
  UsernameValidation
} from '../../libraries/ValidationSchema';

interface UserProfileFormProps {
  onSubmit: (values: UserProfileFormValues, helpers: FormikHelpers<UserProfileFormValues>) => void;
  initialValues: UserProfileFormValues;
}

const validationSchema = Yup.object().shape({
  email: EmailValidation,
  roomNumber: RoomNumberValidation,
});

// https://formik.org/docs/guides/react-native
export const UserProfileForm = ({onSubmit, initialValues}: UserProfileFormProps) => {
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
            name={'displayName'}
            label={'Display Name'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'realName'}
            label={'Real Name'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'preferredPronoun'}
            label={'Pronouns'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'homeLocation'}
            label={'Home Location'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'roomNumber'}
            label={'Cabin Number'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'email'}
            label={'Email'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'message'}
            label={'Welcome Message'}
            autoCapitalize={'sentences'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'about'}
            label={'About'}
            autoCapitalize={'sentences'}
            multiline={true}
          />
          <PrimaryActionButton
            disabled={isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
