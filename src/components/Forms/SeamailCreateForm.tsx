import React, {useEffect} from 'react';
import {Field, Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import {Text, TextInput} from 'react-native-paper';
import {FezContentData} from '../../libraries/Structs/ControllerStructs';
import {BooleanField} from './Fields/BooleanField';
import {AppIcons} from '../../libraries/Enums/Icons';
import {PaddedContentView} from '../Views/Content/PaddedContentView';
import {FezType} from '../../libraries/Enums/FezType';
import {UserChipsField} from './Fields/UserChipsField';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';

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

const InnerSeamailCreateForm = () => {
  const {handleChange, handleBlur, values, setFieldValue} = useFormikContext<FezContentData>();
  const {setAsModerator, setAsTwitarrTeam} = usePrivilege();

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
      <Field name={'title'}>
        {() => (
          <TextInput
            mode={'outlined'}
            onChangeText={handleChange('title')}
            onBlur={handleBlur('title')}
            value={values.title}
          />
        )}
      </Field>
      <BooleanField
        name={'fezType'}
        label={'Open Chat'}
        helperText={'Allows you to add or remove users later.'}
        onPress={() => setFieldValue('fezType', values.fezType === FezType.open ? FezType.closed : FezType.open)}
        value={values.fezType === FezType.open}
      />
      <BooleanField
        name={'createdByModerator'}
        label={'Post as Moderator'}
        icon={AppIcons.moderator}
        helperText={'This will also create the seamail as the Moderator user.'}
      />
      <BooleanField
        name={'createdByTwitarrTeam'}
        label={'Post as TwitarrTeam'}
        icon={AppIcons.twitarteam}
        helperText={'This will also create the seamail as the TwitarrTeam user.'}
      />
    </PaddedContentView>
  );
};

export const SeamailCreateForm = ({onSubmit, formRef}: SeamailCreateFormProps) => {
  return (
    <Formik innerRef={formRef} enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      <InnerSeamailCreateForm />
    </Formik>
  );
};
