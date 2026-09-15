import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import React, {useEffect} from 'react';
import * as Yup from 'yup';

import {PrivilegedAccountButtons} from '#src/Components/Buttons/SegmentedButtons/PrivilegedAccountButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UserChipsField} from '#src/Components/Forms/Fields/UserChipsField';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {FezType} from '#src/Enums/FezType';
import {useElevationFieldSync} from '#src/Hooks/Elevation/useElevationFieldSync';
import {SeamailFormValues} from '#src/Types/FormValues';

interface SeamailCreateFormProps {
  onSubmit: (values: SeamailFormValues, formikBag: FormikHelpers<SeamailFormValues>) => void;
  formRef: React.RefObject<FormikProps<SeamailFormValues> | null>;
  initialValues: SeamailFormValues;
  onValidationChange?: (isValid: boolean) => void;
  showPostAsOptions?: boolean;
}

const validationSchema = Yup.object().shape({
  initialUsers: Yup.array().min(1, 'Add at least one participant.'),
  title: Yup.string().required('Subject cannot be empty.'),
});

interface InnerSeamailCreateFormProps {
  onValidationChange?: (isValid: boolean) => void;
  showPostAsOptions?: boolean;
}

const InnerSeamailCreateForm = ({onValidationChange, showPostAsOptions = true}: InnerSeamailCreateFormProps) => {
  const {values, setFieldValue, isValid, dirty} = useFormikContext<SeamailFormValues>();

  useElevationFieldSync('createdByModerator', 'createdByTwitarrTeam');

  useEffect(() => {
    // Only consider the form valid if it's both valid AND has been touched
    onValidationChange?.(isValid && dirty);
  }, [isValid, dirty, onValidationChange]);

  return (
    <PaddedContentView>
      <DirtyDetectionField />
      <UserChipsField
        name={'initialUsers'}
        testID={'seamailCreateParticipants-input'}
        label={'Participants'}
        minCount={1}
      />
      <TextField name={'title'} testID={'seamailCreateTitle-input'} label={'Subject'} />
      <BooleanField
        name={'fezType'}
        testID={'seamailCreateOpen-switch'}
        label={'Open Chat'}
        helperText={'Allows you to add or remove users later.'}
        onPress={() => setFieldValue('fezType', values.fezType === FezType.open ? FezType.closed : FezType.open)}
        value={values.fezType === FezType.open}
      />
      {showPostAsOptions && <PrivilegedAccountButtons testIDPrefix={'seamailCreatePostAs'} label={'Post as User'} />}
    </PaddedContentView>
  );
};

export const SeamailCreateForm = ({
  onSubmit,
  formRef,
  initialValues,
  onValidationChange,
  showPostAsOptions,
}: SeamailCreateFormProps) => {
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      <InnerSeamailCreateForm onValidationChange={onValidationChange} showPostAsOptions={showPostAsOptions} />
    </Formik>
  );
};
