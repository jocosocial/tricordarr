import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {UsernameValidation} from '#src/Libraries/ValidationSchema';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';

interface ChangeUsernameFormProps {
  onSubmit: (values: ChangeUsernameFormValues, helpers: FormikHelpers<ChangeUsernameFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  username: UsernameValidation,
});

const initialValues: ChangeUsernameFormValues = {
  username: '',
};

// https://formik.org/docs/guides/react-native
export const ChangeUsernameForm = ({onSubmit}: ChangeUsernameFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'username'} label={'Username'} left={<TextInput.Icon icon={AppIcons.user} />} />
          <PrimaryActionButton
            disabled={!values.username || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={[commonStyles.marginTopSmall]}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
