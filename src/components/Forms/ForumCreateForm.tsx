import React, {useEffect} from 'react';
import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import {PaddedContentView} from '../Views/Content/PaddedContentView';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {InfoStringValidation} from '../../libraries/ValidationSchema';
import {ForumThreadValues} from '../../libraries/Types/FormValues';
import {BooleanField} from './Fields/BooleanField';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {AppIcons} from '../../libraries/Enums/Icons';

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
