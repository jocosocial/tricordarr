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
  RecoveryKeyValidation,
  RoomNumberValidation,
  UsernameValidation,
} from '../../libraries/ValidationSchema';
import {PickerField} from './Fields/PickerField';
import {DinnerTeam} from '../../libraries/Enums/DinnerTeam';

interface UserProfileFormProps {
  onSubmit: (values: UserProfileFormValues, helpers: FormikHelpers<UserProfileFormValues>) => void;
  initialValues: UserProfileFormValues;
}

const validationSchema = Yup.object().shape({
  email: EmailValidation,
  roomNumber: RoomNumberValidation,
  displayName: Yup.string().optional().min(2).max(50),
  realName: Yup.string().optional().min(2).max(50),
  preferredPronoun: Yup.string().optional().min(2).max(50),
  homeLocation: Yup.string().optional().min(2).max(50),
  message: Yup.string().optional().min(4).max(80),
  about: Yup.string().optional().min(4).max(400),
});

// https://formik.org/docs/guides/react-native
export const UserProfileForm = ({onSubmit, initialValues}: UserProfileFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
    pickerContainer: [commonStyles.marginBottom],
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'displayName'}
            label={'Display Name'}
            autoCapitalize={'words'}
          />
          <TextField viewStyle={styles.inputContainer} name={'realName'} label={'Real Name'} autoCapitalize={'words'} />
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
          <PickerField
            viewStyle={styles.pickerContainer}
            name={'dinnerTeam'}
            label={'Dinner Team'}
            value={values.dinnerTeam}
            choices={['red', 'gold', 'sro', '']}
            getTitle={value => DinnerTeam.getLabel(value as DinnerTeam)}
          />
          <TextField viewStyle={styles.inputContainer} name={'email'} label={'Email'} />
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
            numberOfLines={3}
          />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting}
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
