import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {DateValidation} from '#src/Libraries/ValidationSchema';
import {AdminAnnouncementFormValues} from '#src/Types/FormValues';

interface AdminAnnouncementFormProps {
  initialValues: AdminAnnouncementFormValues;
  onSubmit: (values: AdminAnnouncementFormValues, helpers: FormikHelpers<AdminAnnouncementFormValues>) => void;
  buttonText: string;
}

const validationSchema = Yup.object().shape({
  text: Yup.string().required('Text cannot be empty').max(2000, 'Announcement text has a 2000 char limit'),
  displayUntilDate: DateValidation,
});

export const AdminAnnouncementForm = ({initialValues, onSubmit, buttonText}: AdminAnnouncementFormProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    field: {
      ...commonStyles.paddingBottomSmall,
    },
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            name={'text'}
            testID={'announcementText-field'}
            label={'Announcement'}
            multiline={true}
            numberOfLines={6}
          />
          <View style={styles.field}>
            <DatePickerField name={'displayUntilDate'} testID={'announcementDate-button'} label={'Display Until'} />
          </View>
          <View style={styles.field}>
            <TimePickerField name={'displayUntilTime'} testID={'announcementTime-button'} />
          </View>
          <PrimaryActionButton
            testID={'announcementSave-button'}
            buttonText={buttonText}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      )}
    </Formik>
  );
};
