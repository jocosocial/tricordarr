import React, {useCallback, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FezContentData, FezData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {FezPostForm} from '../../Forms/FezPostForm';
import {SeamailCreateForm} from '../../Forms/SeamailCreateForm';
import {FormikHelpers, FormikProps} from 'formik';
import {PrivilegeProvider} from '../../Context/Providers/PrivilegeProvider';
import {useFezMutation} from '../../Queries/Fez/FezQueries';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailCreateScreen,
  NavigatorIDs.seamailStack
>;

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<FezContentData>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezMutation();
  const fezPostMutation = useFezPostMutation();
  const [newSeamail, setNewSeamail] = useState<FezData>();
  const [submitting, setSubmitting] = useState(false);
  const {setErrorMessage} = useErrorHandler();

  // Handler for creating the Fez.
  const onFezSubmit = useCallback(
    (values: FezContentData, formikHelpers: FormikHelpers<FezContentData>) => {
      setSubmitting(true);
      console.log('Doing the Fez submit!');
      console.log('Fez Values', values);
      fezMutation.mutate(
        {fezContentData: values},
        {
          onSuccess: response => {
            setNewSeamail(response.data);
            // Whatever we picked in the SeamailCreate is what should be set in the Post.
            seamailPostFormRef.current?.setFieldValue('postAsModerator', values.createdByModerator);
            seamailPostFormRef.current?.setFieldValue('postAsTwitarrTeam', values.createdByTwitarrTeam);
            seamailPostFormRef.current?.submitForm();
          },
          onError: error => {
            setErrorMessage(error);
            setSubmitting(false);
          },
        },
      );
    },
    [fezMutation, setErrorMessage],
  );

  // Handler for pushing the FezPost submit button.
  const onPostSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      if (newSeamail) {
        console.log('Doing the FezPost submit! to', newSeamail.fezID);
        console.log('FezPost Values', values);
        fezPostMutation.mutate(
          {fezID: newSeamail.fezID, postContentData: values},
          {
            onSuccess: () => {
              setSubmitting(false);
              navigation.replace(SeamailStackScreenComponents.seamailScreen, {
                fezID: newSeamail.fezID,
                title: newSeamail.title,
              });
            },
          },
        );
      } else {
        console.error('Seamail is empty?');
        setErrorMessage('Seamail is empty?');
        setSubmitting(false);
      }
    },
    [fezPostMutation, navigation, newSeamail, setErrorMessage],
  );

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = useCallback(() => {
    setSubmitting(true);
    seamailCreateFormRef.current?.submitForm();
  }, []);

  return (
    <AppView>
      <PrivilegeProvider>
        <ScrollingContentView>
          <SeamailCreateForm
            initialUserHeader={route.params?.initialUserHeader}
            formRef={seamailCreateFormRef}
            onSubmit={onFezSubmit}
          />
        </ScrollingContentView>
        <FezPostForm
          formRef={seamailPostFormRef}
          overrideSubmitting={submitting}
          onPress={onSubmit}
          onSubmit={onPostSubmit}
        />
      </PrivilegeProvider>
    </AppView>
  );
};
