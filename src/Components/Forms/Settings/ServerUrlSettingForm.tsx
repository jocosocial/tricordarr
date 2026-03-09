import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {UrlTextField} from '#src/Components/Forms/Fields/UrlTextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ServerChoices, ServerUrlChoice} from '#src/Libraries/Network/ServerChoices';
import {ServerURLValidation} from '#src/Libraries/ValidationSchema';
import {ServerUrlFormValues} from '#src/Types/FormValues';

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
          <UrlTextField
            name={'serverUrl'}
            label={'URL'}
            disabled={values.serverChoice.name !== 'Other'}
            onChangeText={v => {
              setFieldValue('serverUrl', v);
              setFieldValue('serverChoice', {name: 'Other', serverUrl: ''});
            }}
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
