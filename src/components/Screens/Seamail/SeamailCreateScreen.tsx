import React, {MutableRefObject, useCallback, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {Switch, View} from 'react-native';
import {FezContentData, PostContentData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {UserChip} from '../../Chips/UserChip';
import {Chip, Text, TextInput} from 'react-native-paper';
import {FezPostForm} from '../../Forms/FezPostForm';
import {BooleanInput} from '../../Forms/Inputs/BooleanInput';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {SeamailCreateForm} from '../../Forms/SeamailCreateForm';
import {Formik, FormikHelpers, FormikProps} from 'formik';

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
