import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {TextInput} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import {SubmitIconButton} from '../Buttons/IconButtons/SubmitIconButton';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';

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
    wrapperView: [commonStyles.flexRow, commonStyles.marginVerticalSmall],
    input: [
      commonStyles.flex,
      commonStyles.flexColumn,
      commonStyles.roundedBorder,
      // commonStyles.marginLeftSmall,
      commonStyles.justifyCenter,
      // commonStyles.marginRightSmall,
    ],
  };

  // https://formik.org/docs/api/withFormik
  // https://www.programcreek.com/typescript/?api=formik.FormikHelpers
  // https://formik.org/docs/guides/react-native
  return (
    <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
        <View style={styles.wrapperView}>
          <SubmitIconButton colorize={false} onPress={() => console.log('add image')} icon={'image-plus'} />
          <TextInput
            dense={true}
            mode={'flat'}
            style={styles.input}
            multiline={true}
            underlineStyle={commonStyles.displayNone}
            onChangeText={handleChange('text')}
            onBlur={handleBlur('text')}
            value={values.text}
          />
          <SubmitIconButton disabled={!values.text} submitting={isSubmitting} onPress={handleSubmit} />
        </View>
      )}
    </Formik>
  );
};
