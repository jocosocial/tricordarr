import React from 'react';
import {View, TextInput} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';

interface FezPostFormProps {
  onSubmit: (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => void;
}

const initialValues: PostContentData = {
  images: [],
  postAsModerator: false,
  postAsTwitarrTeam: false,
  text: '',
};

// https://formik.org/docs/guides/react-native
export const FezPostForm = ({onSubmit}: FezPostFormProps) => {
  const {commonStyles} = useStyles();

  const styles = {
    formView: [commonStyles.flexRow, commonStyles.marginVerticalSmall],
    inputWrapperView: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.flexColumn],
    input: [commonStyles.roundedBorder, commonStyles.paddingSides, commonStyles.secondaryContainer],
  };

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  //
  // This uses the native TextInput rather than Paper since Paper's was way more
  // annoying to try and stylize for this use.
  return (
    <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
        <View style={styles.formView}>
          <SubmitIconButton colorize={false} onPress={() => console.log('add image')} icon={AppIcons.newImage} />
          <View style={styles.inputWrapperView}>
            <TextInput
              underlineColorAndroid={'transparent'}
              style={styles.input}
              multiline={true}
              onChangeText={handleChange('text')}
              onBlur={handleBlur('text')}
              value={values.text}
            />
          </View>
          <SubmitIconButton disabled={!values.text} submitting={isSubmitting} onPress={handleSubmit} />
        </View>
      )}
    </Formik>
  );
};
