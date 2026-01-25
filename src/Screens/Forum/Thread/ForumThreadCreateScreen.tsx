import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {Item} from 'react-navigation-header-buttons';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {ForumCreateForm} from '#src/Components/Forms/Forum/ForumCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useMaxForumPostImages} from '#src/Hooks/useMaxForumPostImages';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useForumCreateMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumCreateData, ForumData, ForumListData, PostContentData} from '#src/Structs/ControllerStructs';
import {ForumThreadValues} from '#src/Types/FormValues';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadCreateScreen>;

export const ForumThreadCreateScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadCreateHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.forums}
        urlPath={`/forums/${props.route.params.categoryId}/createForum`}>
        <ForumThreadCreateScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumThreadCreateScreenInner = ({route, navigation}: Props) => {
  const forumFormRef = useRef<FormikProps<ForumThreadValues>>(null);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forumFormValid, setForumFormValid] = useState(false);
  const forumCreateMutation = useForumCreateMutation();
  const queryClient = useQueryClient();
  const maxForumPostImages = useMaxForumPostImages();
  // Use a ref to store the created forum data immediately (synchronously) to avoid race condition
  const createdForumRef = useRef<ForumData | null>(null);

  const onForumSubmit = (values: ForumThreadValues, formikHelpers: FormikHelpers<ForumThreadValues>) => {
    setSubmitting(true);
    if (!postFormRef.current) {
      console.error('Post form ref undefined.');
      setSubmitting(false);
      return;
    }
    // Whatever we picked in the Forum is what should be set in the Post.
    // Forum doesn't take these params and keys off of the first post.
    postFormRef.current.setFieldValue('postAsModerator', values.postAsModerator);
    postFormRef.current.setFieldValue('postAsTwitarrTeam', values.postAsTwitarrTeam);
    postFormRef.current.values.text = replaceTriggerValues(postFormRef.current.values.text, ({name}) => `@${name}`);
    const forumData: ForumCreateData = {
      title: values.title,
      firstPost: postFormRef.current.values,
    };
    forumCreateMutation.mutate(
      {
        forumCreateData: forumData,
        categoryId: route.params.categoryId,
      },
      {
        onSuccess: response => {
          // Store in ref immediately (synchronously) to avoid race condition
          createdForumRef.current = response.data;
          // Use ref instead of response.data to avoid race condition - ref is set synchronously
          const createdForum = createdForumRef.current;
          if (createdForum) {
            navigation.replace(CommonStackComponents.forumThreadScreen, {
              forumID: createdForum.forumID,
            });
          }
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      },
    );
  };

  const onPostSubmit = async (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => {
    // Invalidations moved here from onForumSubmit to match pattern from SeamailCreateScreen
    const createdForum = createdForumRef.current;
    if (createdForum) {
      const invalidations = ForumListData.getCacheKeys(createdForum.categoryID, createdForum.forumID).map(key => {
        return queryClient.invalidateQueries({queryKey: key});
      });
      await Promise.all(invalidations);
    }
    formikBag.setSubmitting(false);
  };

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = () => {
    setSubmitting(true);
    forumFormRef.current?.submitForm();
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.forumThreadCreateHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <ForumCreateForm onSubmit={onForumSubmit} formRef={forumFormRef} onValidationChange={setForumFormValid} />
      </ScrollingContentView>
      <ContentPostForm
        onSubmit={onPostSubmit}
        formRef={postFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        enablePhotos={true}
        maxLength={2000}
        maxPhotos={maxForumPostImages}
        disabled={!forumFormValid}
      />
    </AppView>
  );
};
