import {TextField} from './Fields/TextField';
import React from 'react';
import {Formik, FormikHelpers} from 'formik';
import {ForumData} from '../../libraries/Structs/ControllerStructs';
import * as Yup from 'yup';
import {InfoStringValidation} from '../../libraries/ValidationSchema';
import {View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {ForumThreadValues} from '../../libraries/Types/FormValues';

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
