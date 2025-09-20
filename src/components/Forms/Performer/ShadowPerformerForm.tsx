import {PerformerUploadData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {
  InfoStringValidation,
  OptionalBioStringValidation,
  OptionalURLValidation,
} from '#src/Libraries/ValidationSchema.ts';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';
import {TextField} from '#src/Components/Forms/Fields/TextField.tsx';
import {AvatarImageField} from '#src/Components/Forms/Fields/AvatarImageField.tsx';

interface ShadowPerformerFormProps<TData = PerformerUploadData> {
  onSubmit: (values: TData, helpers: FormikHelpers<TData>) => void;
  initialValues: TData;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  name: InfoStringValidation,
  website: OptionalURLValidation,
  facebookURL: OptionalURLValidation,
  xURL: OptionalURLValidation,
  instagramURL: OptionalURLValidation,
  youtubeURL: OptionalURLValidation,
  bio: OptionalBioStringValidation,
});

export const ShadowPerformerForm = ({initialValues, onSubmit, buttonText = 'Create'}: ShadowPerformerFormProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    buttonContainer: commonStyles.marginTopSmall,
    fieldContainer: commonStyles.paddingBottom,
  });

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <AvatarImageField<PerformerUploadData> name={'photo'} imageData={initialValues.photo} />
          <TextField name={'name'} label={'Name'} autoCapitalize={'words'} />
          <TextField name={'pronouns'} label={'Pronouns'} autoCapitalize={'none'} />
          <TextField name={'organization'} label={'Organization'} autoCapitalize={'words'} />
          <TextField name={'title'} label={'Title'} autoCapitalize={'words'} />
          <TextField name={'bio'} label={'Bio'} autoCapitalize={'sentences'} numberOfLines={3} multiline={true} />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid || !dirty}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
          />
        </View>
      )}
    </Formik>
  );
};
