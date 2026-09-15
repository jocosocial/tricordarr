import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import React, {useEffect} from 'react';
import * as Yup from 'yup';

import {PrivilegedAccountButtons} from '#src/Components/Buttons/SegmentedButtons/PrivilegedAccountButtons';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useElevationFieldSync} from '#src/Hooks/Elevation/useElevationFieldSync';
import {InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {ForumThreadValues} from '#src/Types/FormValues';

interface ForumCreateFormProps {
  onSubmit: (values: ForumThreadValues, formikBag: FormikHelpers<ForumThreadValues>) => void;
  formRef: React.RefObject<FormikProps<ForumThreadValues> | null>;
  onValidationChange?: (isValid: boolean) => void;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
});

interface InnerFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const InnerForm = ({onValidationChange}: InnerFormProps) => {
  const {isValid, dirty} = useFormikContext<ForumThreadValues>();

  useElevationFieldSync('postAsModerator', 'postAsTwitarrTeam');

  useEffect(() => {
    // Only consider the form valid if it's both valid AND has been touched
    onValidationChange?.(isValid && dirty);
  }, [isValid, dirty, onValidationChange]);

  return (
    <PaddedContentView>
      <DirtyDetectionField />
      <TextField name={'title'} testID={'forumCreateTitle-input'} label={'Title'} />
      <PrivilegedAccountButtons testIDPrefix={'forumCreatePostAs'} label={'Post as User'} />
    </PaddedContentView>
  );
};

export const ForumCreateForm = ({onSubmit, formRef, onValidationChange}: ForumCreateFormProps) => {
  const initialValues: ForumThreadValues = {
    title: '',
    postAsModerator: false,
    postAsTwitarrTeam: false,
  };
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      <InnerForm onValidationChange={onValidationChange} />
    </Formik>
  );
};
