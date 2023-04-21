import React, {useEffect, useState} from 'react';
import {Formik, FormikHelpers, FormikProps, useFormikContext} from 'formik';
import {Text, TextInput} from 'react-native-paper';
import {View} from 'react-native';
import {FezContentData, UserHeader} from '../../libraries/Structs/ControllerStructs';
import {UserChip} from '../Chips/UserChip';
import {BooleanInput} from './Inputs/BooleanInput';
import {AppIcons} from '../../libraries/Enums/Icons';
import {PaddedContentView} from '../Views/Content/PaddedContentView';
import {FezType} from '../../libraries/Enums/FezType';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {UserSearchBar} from '../Search/UserSearchBar';

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

export const SeamailCreateForm = ({onSubmit, formRef}: SeamailCreateFormProps) => {
  return (
    <Formik innerRef={formRef} enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
        <View>
          <PaddedContentView>
            <TextInput
              mode={'outlined'}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
              label={'Subject'}
            />
          </PaddedContentView>
        </View>
      )}
    </Formik>
  );
};
