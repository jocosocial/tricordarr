import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {FezData} from '#src/Structs/ControllerStructs';
import {ForumThreadValues} from '#src/Types/FormValues';

interface SeamailEditFormProps {
  fez: FezData;
  onSubmit: (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => void;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
});

export const SeamailEditForm = ({fez, onSubmit}: SeamailEditFormProps) => {
  const {commonStyles} = useStyles();
  const initialValues: ForumThreadValues = {
    title: fez.title,
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'title'} label={'Title'} />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid || !dirty}
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
