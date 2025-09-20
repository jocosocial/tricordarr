import React, {useEffect} from 'react';
import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import * as Yup from 'yup';
import {TextField} from '#src/Components/Forms/Fields/TextField.tsx';
import {InfoStringValidation} from '#src/Libraries/ValidationSchema.ts';
import {ForumThreadValues} from '#src/Libraries/Types/FormValues.ts';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField.tsx';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';

interface ForumCreateFormProps {
  onSubmit: (values: ForumThreadValues, formikBag: FormikHelpers<ForumThreadValues>) => void;
  formRef: React.RefObject<FormikProps<ForumThreadValues>>;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
});

const InnerForm = () => {
  const {values} = useFormikContext<ForumThreadValues>();
  const {setAsModerator, setAsTwitarrTeam, hasModerator, hasTwitarrTeam} = usePrivilege();
  useEffect(() => {
    if (values.postAsModerator !== undefined) {
      setAsModerator(values.postAsModerator);
    }
    if (values.postAsTwitarrTeam !== undefined) {
      setAsTwitarrTeam(values.postAsTwitarrTeam);
    }
  }, [values, setAsModerator, setAsTwitarrTeam]);

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

export const ForumCreateForm = ({onSubmit, formRef}: ForumCreateFormProps) => {
  const {} = usePrivilege();
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
      <InnerForm />
    </Formik>
  );
};
