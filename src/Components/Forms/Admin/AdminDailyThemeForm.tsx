import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AvatarImageField} from '#src/Components/Forms/Fields/AvatarImageField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {IntegerValidation} from '#src/Libraries/ValidationSchema';
import {AdminDailyThemeFormValues} from '#src/Types/FormValues';

interface AdminDailyThemeFormProps {
  initialValues: AdminDailyThemeFormValues;
  onSubmit: (values: AdminDailyThemeFormValues, helpers: FormikHelpers<AdminDailyThemeFormValues>) => void;
  buttonText: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  info: Yup.string().required('Info is required'),
  cruiseDay: IntegerValidation,
});

export const AdminDailyThemeForm = ({initialValues, onSubmit, buttonText}: AdminDailyThemeFormProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    image: {
      ...commonStyles.paddingBottomSmall,
    },
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, values}) => (
        <View>
          <DirtyDetectionField />
          <View style={styles.image}>
            <AvatarImageField name={'image'} testIDPrefix={'dailyTheme'} imageData={values.image} />
          </View>
          <TextField name={'title'} testID={'themeTitle-field'} label={'Title'} />
          <TextField name={'info'} testID={'themeInfo-field'} label={'Info'} multiline={true} numberOfLines={4} />
          <TextField
            name={'cruiseDay'}
            testID={'themeCruiseDay-field'}
            label={'Cruise Day'}
            keyboardType={'number-pad'}
            infoText={'0 is embarkation day. Negative values are allowed (for example, -1 is Anticipation Day).'}
          />
          <PrimaryActionButton
            testID={'themeSave-button'}
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
