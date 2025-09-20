import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {DinnerTeam} from '#src/Enums/DinnerTeam';
import {EmailValidation, RoomNumberValidation} from '#src/Libraries/ValidationSchema';
import {UserProfileFormValues} from '#src/Types/FormValues';

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
          <DirtyDetectionField />
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
            autoCapitalize={'none'}
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
            keyboardType={'numeric'}
          />
          <PickerField
            viewStyle={styles.pickerContainer}
            name={'dinnerTeam'}
            label={'Dinner Team'}
            value={values.dinnerTeam}
            choices={['red', 'gold', 'sro', '']}
            getTitle={value => DinnerTeam.getLabel(value as DinnerTeam)}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'email'}
            label={'Email'}
            autoCapitalize={'none'}
            keyboardType={'email-address'}
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
