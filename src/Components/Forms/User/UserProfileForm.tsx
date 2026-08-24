import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {EmailTextField} from '#src/Components/Forms/Fields/EmailTextField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UsernameTextField} from '#src/Components/Forms/Fields/UsernameTextField';
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
  discordUsername: Yup.string().optional().min(2).max(50),
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
            testID={'userProfileDisplayName-input'}
            label={'Display Name'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'realName'}
            testID={'userProfileRealName-input'}
            label={'Real Name'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'preferredPronoun'}
            testID={'userProfilePronouns-input'}
            label={'Pronouns'}
            autoCapitalize={'none'}
            autoCorrect={false}
            spellCheck={false}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'homeLocation'}
            testID={'userProfileHomeLocation-input'}
            label={'Home Location'}
            autoCapitalize={'words'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'roomNumber'}
            testID={'userProfileCabin-input'}
            label={'Cabin Number'}
            autoCapitalize={'words'}
            keyboardType={'numeric'}
          />
          <UsernameTextField
            viewStyle={styles.inputContainer}
            name={'discordUsername'}
            testID={'userProfileDiscord-input'}
            label={'Discord Username'}
          />
          <PickerField
            viewStyle={styles.pickerContainer}
            name={'dinnerTeam'}
            testID={'userProfileDinnerTeam-button'}
            label={'Dinner Team'}
            value={values.dinnerTeam}
            choices={['red', 'gold', 'sro', '']}
            getTitle={value => DinnerTeam.getLabel(value as DinnerTeam)}
          />
          <EmailTextField
            viewStyle={styles.inputContainer}
            name={'email'}
            testID={'userProfileEmail-input'}
            label={'Email'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'message'}
            testID={'userProfileWelcome-input'}
            label={'Welcome Message'}
            autoCapitalize={'sentences'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'about'}
            testID={'userProfileAbout-input'}
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
            testID={'userProfileSave-button'}
          />
        </View>
      )}
    </Formik>
  );
};
