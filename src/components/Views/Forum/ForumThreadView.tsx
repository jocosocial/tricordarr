import {PostAsUserBanner} from '../../Banners/PostAsUserBanner';
import {ListTitleView} from '../ListTitleView';
import {ForumLockedView} from '../Static/ForumLockedView';
import {ForumPostFlatList} from '../../Lists/Forums/ForumPostFlatList';
import {FlatList, RefreshControl} from 'react-native';
import {ContentPostForm} from '../../Forms/ContentPostForm';
import {AppView} from '../AppView';
import React, {ReactNode, useRef} from 'react';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {PostContentData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {useForumPostCreateMutation} from '../../Queries/Forum/ForumPostQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface ForumThreadViewProps {
  hasNextPage?: boolean;
  handleLoadNext: () => void;
  hasPreviousPage?: boolean;
  handleLoadPrevious: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  startScreenAtBottom?: boolean;
  getListHeader: () => ReactNode;
}

export const ForumThreadView = ({
  hasNextPage,
  handleLoadNext,
  hasPreviousPage,
  handleLoadPrevious,
  refreshing,
  onRefresh,
  startScreenAtBottom = false,
  getListHeader,
}: ForumThreadViewProps) => {
  const {hasModerator} = usePrivilege();
  const postCreateMutation = useForumPostCreateMutation();
  const {setErrorMessage} = useErrorHandler();
  const flatListRef = useRef<FlatList<PostData>>(null);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    if (!forumData) {
      setErrorMessage('Forum Data missing? This is definitely a bug.');
      formikHelpers.setSubmitting(false);
      return;
    }
    postCreateMutation.mutate(
      {
        forumID: forumData.forumID,
        postData: values,
      },
      {
        onSuccess: response => {
          dispatchForumThreadPosts({
            type: ForumPostListActions.prependPost,
            newPost: response.data,
          });
          if (forumListItem) {
            dispatchForumListData({
              type: ForumListDataActions.touch,
              thread: {
                ...forumListItem,
                postCount: forumListItem.postCount + 1,
                readCount: forumListItem.readCount + 1,
                lastPostAt: new Date().toISOString(),
                lastPoster: profilePublicData?.header,
              },
            });
          }
          formikHelpers.resetForm();
          // https://github.com/jocosocial/swiftarr/issues/237
          // Refetch needed to "mark" the forum as read.
          refetch().then(() => {
            flatListRef.current?.scrollToOffset({offset: 0, animated: false});
          });
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
        },
      },
    );
  };

  return (
    <AppView>
      <PostAsUserBanner />
      <ListTitleView title={forumData?.title} />
      {forumData?.isLocked && <ForumLockedView />}
      <ForumPostFlatList
        postList={forumThreadPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={route.params.postID ? undefined : handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh} />}
        invertList={startScreenAtBottom}
        forumData={forumData}
        hasPreviousPage={route.params.postID ? undefined : hasPreviousPage}
        maintainViewPosition={true}
        getListHeader={route.params.postID ? getListHeader : undefined}
        flatListRef={flatListRef}
        forumListData={forumListItem}
        hasNextPage={hasNextPage}
      />
      {(!forumData?.isLocked || hasModerator) && (
        <ContentPostForm onSubmit={onPostSubmit} enablePhotos={true} maxLength={2000} maxPhotos={4} />
      )}
    </AppView>
  );
};
