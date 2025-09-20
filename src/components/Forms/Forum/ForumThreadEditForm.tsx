import {TextField} from '#src/Components/Forms/Fields/TextField.tsx';
import React from 'react';
import {Formik, FormikHelpers} from 'formik';
import {ForumData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import * as Yup from 'yup';
import {InfoStringValidation} from '#src/Libraries/ValidationSchema.ts';
import {View} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {ForumThreadValues} from '#src/Libraries/Types/FormValues.ts';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';

interface ForumThreadEditFormProps {
  forumData: ForumData;
  onSubmit: (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => void;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
});

export const ForumThreadEditForm = ({forumData, onSubmit}: ForumThreadEditFormProps) => {
  const {commonStyles} = useStyles();
  const initialValues: ForumThreadValues = {
    title: forumData.title,
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'title'} label={'Title'} />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid}
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
