import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {KeywordFormValues} from '../../libraries/Types/FormValues';
import {TextField} from './Fields/TextField';
import {useStyles} from '../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {KeywordValidation} from '../../libraries/ValidationSchema';

const validationSchema = Yup.object().shape({
  keyword: KeywordValidation,
});

interface KeywordFormProps {
  onSave: (values: KeywordFormValues, helpers: FormikHelpers<KeywordFormValues>) => void;
}

const initialFormValues: KeywordFormValues = {
  keyword: '',
};

export const KeywordForm = ({onSave}: KeywordFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik enableReinitialize initialValues={initialFormValues} onSubmit={onSave} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting}) => (
        <View>
          <TextField autoCapitalize={'none'} name={'keyword'} />
          <PrimaryActionButton
            onPress={handleSubmit}
            buttonText={'Save'}
            style={[commonStyles.marginTopSmall]}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      )}
    </Formik>
  );
};
