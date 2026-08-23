import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ReportData} from '#src/Structs/ControllerStructs';

interface ReportContentFormProps {
  onSubmit: (values: ReportData, formikBag: FormikHelpers<ReportData>) => void;
}

const initialValues: ReportData = {
  message: '',
};

// https://formik.org/docs/guides/react-native
export const ReportContentForm = ({onSubmit}: ReportContentFormProps) => {
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };

  return (
    <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleSubmit, isSubmitting}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            viewStyle={styles.inputContainer}
            name={'message'}
            label={'Additional Information'}
            multiline={true}
            numberOfLines={3}
            autoCapitalize={'sentences'}
          />
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Send Report'}
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            viewStyle={styles.buttonContainer}
          />
        </View>
      )}
    </Formik>
  );
};
