import React, {useEffect} from 'react';
import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import {Text} from 'react-native-paper';
import {FezContentData} from '../../libraries/Structs/ControllerStructs';
import {BooleanField} from './Fields/BooleanField';
import {AppIcons} from '../../libraries/Enums/Icons';
import {PaddedContentView} from '../Views/Content/PaddedContentView';
import {FezType} from '../../libraries/Enums/FezType';
import {UserChipsField} from './Fields/UserChipsField';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import * as Yup from 'yup';
import {TextField} from './Fields/TextField';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {UserAccessLevel} from '../../libraries/Enums/UserAccessLevel';

interface SeamailCreateFormProps {
  onSubmit: (values: FezContentData, formikBag: FormikHelpers<FezContentData>) => void;
  formRef: React.RefObject<FormikProps<FezContentData>>;
}

const initialValues: FezContentData = {
  fezType: FezType.open,
  info: '',
  initialUsers: [],
  maxCapacity: 0,
  minCapacity: 0,
  title: '',
  createdByTwitarrTeam: false,
  createdByModerator: false,
};

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Subject cannot be empty.'),
});

const InnerSeamailCreateForm = () => {
  const {values, setFieldValue} = useFormikContext<FezContentData>();
  const {setAsModerator, setAsTwitarrTeam} = usePrivilege();
  const {accessLevel} = useUserData();

  useEffect(() => {
    if (values.createdByModerator !== undefined) {
      setAsModerator(values.createdByModerator);
    }
    if (values.createdByTwitarrTeam !== undefined) {
      setAsTwitarrTeam(values.createdByTwitarrTeam);
    }
  }, [values, setAsModerator, setAsTwitarrTeam]);

  return (
    <PaddedContentView>
      <UserChipsField name={'initialUsers'} label={'Participants'} />
      <Text>Subject</Text>
      <TextField name={'title'} />
      <BooleanField
        name={'fezType'}
        label={'Open Chat'}
        helperText={'Allows you to add or remove users later.'}
        onPress={() => setFieldValue('fezType', values.fezType === FezType.open ? FezType.closed : FezType.open)}
        value={values.fezType === FezType.open}
      />
      {UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.moderator) && (
        <BooleanField
          name={'createdByModerator'}
          label={'Post as Moderator'}
          icon={AppIcons.moderator}
          helperText={'This will also create the seamail as the Moderator user.'}
        />
      )}
      {UserAccessLevel.hasAccess(accessLevel, UserAccessLevel.twitarrteam) && (
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

export const SeamailCreateForm = ({onSubmit, formRef}: SeamailCreateFormProps) => {
  return (
    <Formik
      innerRef={formRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      <InnerSeamailCreateForm />
    </Formik>
  );
};
