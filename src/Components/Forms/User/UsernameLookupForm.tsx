import {Formik, FormikHelpers} from 'formik';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {AccountRecoveryValidation, RegistrationCodeValidation} from '#src/Libraries/ValidationSchema';
import {UsernameLookupFormValues} from '#src/Types/FormValues';

interface UsernameLookupFormProps {
  onSubmit: (values: UsernameLookupFormValues, helpers: FormikHelpers<UsernameLookupFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  registrationCode: RegistrationCodeValidation,
  recoveryKey: AccountRecoveryValidation,
});

const initialValues: UsernameLookupFormValues = {
  registrationCode: '',
  recoveryKey: '',
};

/**
 * Collects the registration code and verification string needed to look up a forgotten
 * username. Presentational only; the caller owns the mutation.
 */
export const UsernameLookupForm = ({onSubmit}: UsernameLookupFormProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <TextField
            name={'registrationCode'}
            testID={'usernameLookupCode-input'}
            label={'Registration Code'}
            left={<TextInput.Icon icon={AppIcons.registrationCode} />}
            autoCapitalize={'none'}
            autoCorrect={false}
            spellCheck={false}
            infoText={'Mailed to you by THO before the cruise. Spaces are optional.'}
          />
          <TextField
            name={'recoveryKey'}
            testID={'usernameLookupKey-input'}
            label={'Recovery Key or Password'}
            autoCapitalize={'none'}
            autoCorrect={false}
            spellCheck={false}
            infoText={'Your Recovery Key (displayed when you created your account) or your current password.'}
          />
          <PrimaryActionButton
            disabled={!values.registrationCode || !values.recoveryKey || !isValid || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Find Username'}
            testID={'usernameLookupSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
