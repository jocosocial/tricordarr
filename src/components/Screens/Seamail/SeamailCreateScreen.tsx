import React, {useCallback, useRef} from 'react';
import {AppView} from '../../Views/AppView';
import {FezContentData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {FezPostForm} from '../../Forms/FezPostForm';
import {SeamailCreateForm} from '../../Forms/SeamailCreateForm';
import {FormikHelpers, FormikProps} from 'formik';

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = () => {
  const seamailCreateFormRef = useRef<FormikProps<FezContentData>>(null);

  // Handler for creating the Fez.
  const onFezSubmit = useCallback(async (values: FezContentData, formikHelpers: FormikHelpers<FezContentData>) => {
    console.log('Doing the Fez submit!');
    console.log('Fez Values', values);
    formikHelpers.setSubmitting(false);
    formikHelpers.resetForm();
  }, []);

  // Handler for pushing the FezPost submit button. This should trigger Fez creation before
  // making the post.
  const onPostSubmit = useCallback(
    async (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      // formikHelpers do not have .handleSubmit() :(
      await seamailCreateFormRef.current?.submitForm();
      console.log('Doing the FezPost submit!');
      console.log('FezPost Values', values);
      formikHelpers.setSubmitting(false);
      formikHelpers.resetForm();
    },
    [seamailCreateFormRef],
  );

  return (
    <AppView>
      <ScrollingContentView>
        <SeamailCreateForm formRef={seamailCreateFormRef} onSubmit={onFezSubmit} />
      </ScrollingContentView>
      <FezPostForm onSubmit={onPostSubmit} />
    </AppView>
  );
};
