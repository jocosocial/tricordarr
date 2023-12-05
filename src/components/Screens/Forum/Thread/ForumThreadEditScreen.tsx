import {AppView} from '../../../Views/AppView';
import React from 'react';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {ForumThreadEditForm} from '../../../Forms/ForumThreadEditForm';
import {ForumThreadValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useForumRenameMutation} from '../../../Queries/Forum/ForumMutationQueries';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadEditScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadEditScreen = ({route, navigation}: Props) => {
  const editMutation = useForumRenameMutation();
  const {forumListData, dispatchForumListData, forumData, setForumData} = useTwitarr();
  const onSubmit = (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => {
    editMutation.mutate(
      {
        forumID: route.params.forumData.forumID,
        name: values.title,
      },
      {
        onSuccess: () => {
          const listDataItem = forumListData.find(fdl => fdl.forumID === route.params.forumData.forumID);
          if (listDataItem) {
            dispatchForumListData({
              type: ForumListDataActions.updateThread,
              newThread: {
                ...listDataItem,
                title: values.title,
              },
            });
          }
          setForumData({
            ...route.params.forumData,
            title: values.title,
          });
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
