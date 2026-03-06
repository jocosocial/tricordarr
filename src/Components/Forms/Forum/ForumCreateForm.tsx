import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import React, {useEffect} from 'react';
import * as Yup from 'yup';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
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
  const {values, isValid, dirty} = useFormikContext<ForumThreadValues>();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {becomeUser, clearElevation} = useElevation();

  useEffect(() => {
    if (values.postAsModerator) {
      becomeUser(PrivilegedUserAccounts.moderator);
    } else if (values.postAsTwitarrTeam) {
      becomeUser(PrivilegedUserAccounts.TwitarrTeam);
    } else {
      clearElevation();
    }
  }, [values.postAsModerator, values.postAsTwitarrTeam, becomeUser, clearElevation]);

  useEffect(() => {
    // Only consider the form valid if it's both valid AND has been touched
    onValidationChange?.(isValid && dirty);
  }, [isValid, dirty, onValidationChange]);

  return (
    <PaddedContentView>
      <DirtyDetectionField />
      <TextField name={'title'} label={'Title'} />
      {hasModerator && (
        <BooleanField
          name={'postAsModerator'}
          label={'Post as Moderator'}
          icon={AppIcons.moderator}
          helperText={'This will also create the forum as the Moderator user.'}
        />
      )}
      {hasTwitarrTeam && (
        <BooleanField
          name={'postAsTwitarrTeam'}
          label={'Post as TwitarrTeam'}
          icon={AppIcons.twitarteam}
          helperText={'This will also create the forum as the TwitarrTeam user.'}
        />
      )}
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
