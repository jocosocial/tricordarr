import React from 'react';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {PaddedContentView} from '../Views/Content/PaddedContentView';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {InfoStringValidation} from '../../libraries/ValidationSchema';
import {ForumThreadValues} from '../../libraries/Types/FormValues';

interface ForumCreateFormProps {
  onSubmit: (values: ForumThreadValues, formikBag: FormikHelpers<ForumThreadValues>) => void;
  formRef: React.RefObject<FormikProps<ForumThreadValues>>;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
});

export const ForumCreateForm = ({onSubmit, formRef}: ForumCreateFormProps) => {
  const initialValues = {
    title: '',
  };
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      <PaddedContentView>
        <TextField name={'title'} label={'Title'} />
      </PaddedContentView>
    </Formik>
  );
};
