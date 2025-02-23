import {ServerUrlFormValues} from '../../../libraries/Types/FormValues.ts';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {ServerURLValidation} from '../../../libraries/ValidationSchema.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import React from 'react';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {View} from 'react-native';
import {PickerField} from '../Fields/PickerField.tsx';
import {TextField} from '../Fields/TextField.tsx';
import {ServerChoices, ServerUrlChoice} from '../../../libraries/Network/ServerChoices.ts';
import {DirtyDetectionField} from '../Fields/DirtyDetectionField.tsx';

interface ServerUrlFormProps {
  initialValues: ServerUrlFormValues;
  onSubmit: (values: ServerUrlFormValues, helpers: FormikHelpers<ServerUrlFormValues>) => void;
  disabled?: boolean;
}

const validationSchema = Yup.object().shape({
  serverUrl: ServerURLValidation,
});

export const ServerUrlSettingForm = (props: ServerUrlFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmit} validationSchema={validationSchema}>
      {({values, handleSubmit, isSubmitting, isValid, dirty, setFieldValue}) => (
        <View>
          <DirtyDetectionField />
          <View style={[commonStyles.paddingBottom]}>
            <PickerField<ServerUrlChoice>
              name={'serverChoice'}
              label={'Server'}
              value={values.serverChoice}
              choices={ServerChoices.serverChoices}
              getTitle={c => c?.name || 'Unknown'}
              onSelect={c => {
                setFieldValue('serverUrl', c?.serverUrl);
              }}
              disabled={props.disabled}
            />
          </View>
          <TextField
            name={'serverUrl'}
            label={'URL'}
            disabled={values.serverChoice.name !== 'Other'}
            onChangeText={v => {
              setFieldValue('serverUrl', v);
              setFieldValue('serverChoice', {name: 'Other', serverUrl: ''});
            }}
            autoCapitalize={'none'}
          />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            viewStyle={commonStyles.marginTopSmall}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
