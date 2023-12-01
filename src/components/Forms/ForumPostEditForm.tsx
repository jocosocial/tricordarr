import * as Yup from 'yup';
import {ImageUploadData, PostContentData, PostData} from '../../libraries/Structs/ControllerStructs';
import {Formik, FormikHelpers} from 'formik';
import {useStyles} from '../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {TextField} from './Fields/TextField';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import React from 'react';
import {ContentInsertPhotosView} from '../Views/ContentInsertPhotosView';

const validationSchema = Yup.object().shape({
  text: Yup.string()
    .required('Post is required.')
    .min(1, 'Post cannot be empty.')
    .max(2000, 'Post must be less than 500 characters.')
    .test('maxLines', 'Post must be less than 25 lines', value => {
      return value.split(/\r\n|\r|\n/).length <= 25;
    }),
});

interface ForumPostEditFormProps {
  postData: PostData;
  onSubmit: (values: PostContentData, helpers: FormikHelpers<PostContentData>) => void;
}
export const ForumPostEditForm = ({postData, onSubmit}: ForumPostEditFormProps) => {
  const {commonStyles} = useStyles();
  const initialValues: PostContentData = {
    text: postData.text,
    images:
      postData.images?.map((fileName: string): ImageUploadData => {
        return {filename: fileName};
      }) || [],
    postAsModerator: false,
    postAsTwitarrTeam: false,
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid}) => (
        <View>
          <TextField name={'text'} label={'Text'} multiline={true} />
          <ContentInsertPhotosView />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid}
            isLoading={isSubmitting}
            viewStyle={[commonStyles.marginTopSmall]}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
