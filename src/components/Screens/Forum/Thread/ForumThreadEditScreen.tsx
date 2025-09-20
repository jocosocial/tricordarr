import {AppView} from '../../../Views/AppView.tsx';
import React from 'react';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumThreadEditForm} from '../../../Forms/Forum/ForumThreadEditForm.tsx';
import {ForumThreadValues} from '../../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useForumRenameMutation} from '../../../Queries/Forum/ForumThreadMutationQueries.ts';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens.tsx';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadEditScreen>;

export const ForumThreadEditScreen = ({route, navigation}: Props) => {
  const editMutation = useForumRenameMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => {
    editMutation.mutate(
      {
        forumID: route.params.forumData.forumID,
        name: values.title,
      },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries([`/forum/${route.params.forumData.forumID}`]),
            queryClient.invalidateQueries([`/forum/categories/${route.params.forumData.categoryID}`]),
            queryClient.invalidateQueries(['/forum/search']),
          ]);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <ForumThreadEditForm forumData={route.params.forumData} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
