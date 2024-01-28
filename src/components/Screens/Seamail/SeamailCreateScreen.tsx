import React, {useCallback, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FezContentData, FezData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {ContentPostForm} from '../../Forms/ContentPostForm';
import {SeamailCreateForm} from '../../Forms/SeamailCreateForm';
import {FormikProps} from 'formik';
import {useFezCreateMutation} from '../../Queries/Fez/FezQueries';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {PostAsUserBanner} from '../../Banners/PostAsUserBanner';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailCreateScreen>;

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<FezContentData>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezCreateMutation();
  const fezPostMutation = useFezPostMutation();
  const [newSeamail, setNewSeamail] = useState<FezData>();
  const [submitting, setSubmitting] = useState(false);
  const {setErrorMessage} = useErrorHandler();
  const {dispatchFezList} = useTwitarr();

  const initialFormValues: FezContentData = {
    fezType: FezType.open,
    info: '',
    initialUsers: [],
    maxCapacity: 0,
    minCapacity: 0,
    title: '',
    createdByTwitarrTeam: route.params?.initialAsTwitarrTeam || false,
    createdByModerator: route.params?.initialAsModerator || false,
  };

  // Handler for creating the Fez.
  const onFezSubmit = useCallback(
    (values: FezContentData) => {
      setSubmitting(true);
      console.log('Doing the Fez submit!');
      console.log('Fez Values', values);
      fezMutation.mutate(
        {fezContentData: values},
        {
          onSuccess: response => {
            setNewSeamail(response.data);
            dispatchFezList({
              type: FezListActions.insert,
              fez: response.data,
            });
            // Whatever we picked in the SeamailCreate is what should be set in the Post.
            seamailPostFormRef.current?.setFieldValue('postAsModerator', values.createdByModerator);
            seamailPostFormRef.current?.setFieldValue('postAsTwitarrTeam', values.createdByTwitarrTeam);
            seamailPostFormRef.current?.submitForm();
          },
          onSettled: () => {
            setSubmitting(false);
            seamailCreateFormRef.current?.setSubmitting(false);
          },
        },
      );
    },
    [dispatchFezList, fezMutation],
  );

  // Handler for pushing the FezPost submit button.
  const onPostSubmit = useCallback(
    (values: PostContentData) => {
      if (newSeamail) {
        console.log('Doing the FezPost submit! to', newSeamail.fezID);
        console.log('FezPost Values', values);
        fezPostMutation.mutate(
          {fezID: newSeamail.fezID, postContentData: values},
          {
            onSuccess: () => {
              setSubmitting(false);
              navigation.replace(CommonStackComponents.seamailScreen, {
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
      <PostAsUserBanner />
      <ScrollingContentView>
        <SeamailCreateForm
          initialUserHeader={route.params?.initialUserHeader}
          formRef={seamailCreateFormRef}
          onSubmit={onFezSubmit}
          initialValues={initialFormValues}
        />
      </ScrollingContentView>
      <ContentPostForm
        formRef={seamailPostFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        onSubmit={onPostSubmit}
        enablePhotos={false}
      />
    </AppView>
  );
};
