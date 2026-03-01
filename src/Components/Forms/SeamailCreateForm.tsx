import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import React, {useEffect} from 'react';
import * as Yup from 'yup';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {UserChipsField} from '#src/Components/Forms/Fields/UserChipsField';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {SeamailFormValues} from '#src/Types/FormValues';

interface SeamailCreateFormProps {
  onSubmit: (values: SeamailFormValues, formikBag: FormikHelpers<SeamailFormValues>) => void;
  formRef: React.RefObject<FormikProps<SeamailFormValues> | null>;
  initialValues: SeamailFormValues;
  onValidationChange?: (isValid: boolean) => void;
}

const validationSchema = Yup.object().shape({
  initialUsers: Yup.array().min(1, 'Add at least one participant.'),
  title: Yup.string().required('Subject cannot be empty.'),
});

interface InnerSeamailCreateFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const InnerSeamailCreateForm = ({onValidationChange}: InnerSeamailCreateFormProps) => {
  const {values, setFieldValue, isValid, dirty} = useFormikContext<SeamailFormValues>();
  const {setAsModerator, setAsTwitarrTeam, clearPrivileges, hasTwitarrTeam, hasModerator} = usePrivilege();

  useEffect(() => {
    if (values.createdByModerator !== undefined) {
      setAsModerator(values.createdByModerator);
    }
    if (values.createdByTwitarrTeam !== undefined) {
      setAsTwitarrTeam(values.createdByTwitarrTeam);
    }
    // return () => clearPrivileges();
  }, [values, setAsModerator, setAsTwitarrTeam, clearPrivileges]);

  useEffect(() => {
    // Only consider the form valid if it's both valid AND has been touched
    onValidationChange?.(isValid && dirty);
  }, [isValid, dirty, onValidationChange]);

  return (
    <PaddedContentView>
      <DirtyDetectionField />
      <UserChipsField name={'initialUsers'} label={'Participants'} minCount={1} />
      <TextField name={'title'} label={'Subject'} />
      <BooleanField
        name={'fezType'}
        label={'Open Chat'}
        helperText={'Allows you to add or remove users later.'}
        onPress={() => setFieldValue('fezType', values.fezType === FezType.open ? FezType.closed : FezType.open)}
        value={values.fezType === FezType.open}
      />
      {hasModerator && (
        <BooleanField
          name={'createdByModerator'}
          label={'Post as Moderator'}
          icon={AppIcons.moderator}
          helperText={'This will also create the seamail as the Moderator user.'}
        />
      )}
      {hasTwitarrTeam && (
        <BooleanField
          name={'createdByTwitarrTeam'}
          label={'Post as TwitarrTeam'}
          icon={AppIcons.twitarteam}
          helperText={'This will also create the seamail as the TwitarrTeam user.'}
        />
      )}
    </PaddedContentView>
  );
};

export const SeamailCreateForm = ({onSubmit, formRef, initialValues, onValidationChange}: SeamailCreateFormProps) => {
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      <InnerSeamailCreateForm onValidationChange={onValidationChange} />
    </Formik>
  );
};
