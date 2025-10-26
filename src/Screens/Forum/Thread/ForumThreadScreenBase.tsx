import {InfiniteData, QueryObserverResult, useQueryClient} from '@tanstack/react-query';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {type TConversationListRef} from '#src/Components/Lists/ConversationList';
import {ForumConversationList} from '#src/Components/Lists/Forums/ForumConversationList';
import {ForumThreadScreenActionsMenu} from '#src/Components/Menus/Forum/ForumThreadScreenActionsMenu';
import {ForumThreadPinnedPostsItem} from '#src/Components/Menus/Forum/Items/ForumThreadPinnedPostsItem';
import {ForumThreadSearchPostsItem} from '#src/Components/Menus/Forum/Items/ForumThreadSearchPostsItem';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ForumLockedView} from '#src/Components/Views/Static/ForumLockedView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumPostCreateMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {ForumData, ForumListData, PostContentData, PostData} from '#src/Structs/ControllerStructs';

interface ForumThreadScreenBaseProps {
  data?: InfiniteData<ForumData>;
  refetch: () => Promise<QueryObserverResult>;
  isLoading: boolean;
  fetchNextPage: () => Promise<QueryObserverResult>;
  fetchPreviousPage: () => Promise<QueryObserverResult>;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  getListHeader?: () => React.JSX.Element;
  invertList?: boolean;
  forumListData?: ForumListData;
}

/**
 * Used for a regular forum thread display. This is shared between viewing a thread
 * from the forum list or from a particular post.
 *
 * @TODO test that this doesn't jump around, especially with the "thread from post".
 */
export const ForumThreadScreenBase = ({
  data,
  refetch,
  isLoading,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  hasNextPage,
  hasPreviousPage,
  getListHeader,
  invertList,
  forumListData,
}: ForumThreadScreenBaseProps) => {
  const navigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const flatListRef = useRef<TConversationListRef>(null);
  const {hasModerator} = usePrivilege();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();
  const queryClient = useQueryClient();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  // Needed for useEffect checking.
  const forumData = data?.pages[0];
  // This should not expire the `/forum/:ID` data on mark-as-read because there is no read data in there
  // to care about. It's all in the category (ForumListData) queries.
  const markReadInvalidationKeys = ForumListData.getCacheKeys(data?.pages[0].categoryID);
  const otherInvalidationKeys = ForumListData.getCacheKeys(data?.pages[0].categoryID, data?.pages[0].forumID);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  const getNavButtons = useCallback(() => {
    // Typescript struggles
    if (!data?.pages[0]) {
      return <></>;
    }
    const eventID = data.pages[0].eventID;

    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {eventID && (
            <Item
              title={'Event'}
              iconName={AppIcons.events}
              onPress={() => navigation.push(CommonStackComponents.eventScreen, {eventID: eventID})}
            />
          )}
          <ForumThreadPinnedPostsItem forumID={data.pages[0].forumID} navigation={navigation} />
          <ForumThreadSearchPostsItem navigation={navigation} forum={data.pages[0]} />
          <ForumThreadScreenActionsMenu
            forumData={data.pages[0]}
            invalidationQueryKeys={otherInvalidationKeys}
            onRefresh={onRefresh}
          />
        </HeaderButtons>
      </View>
    );
  }, [data?.pages, otherInvalidationKeys, navigation, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      const postListData = data.pages.flatMap(fd => fd.posts);
      setForumPosts(postListData);
    }
  }, [data, setForumPosts, invertList]);

  useEffect(() => {
    if (forumData) {
      if (forumListData && forumListData.readCount === forumListData.postCount) {
        console.log(`[ForumThreadScreenBase.tsx] Forum ${forumData.forumID} has already been read.`);
        return;
      }
      console.log(
        `[ForumThreadScreenBase.tsx] Marking forum ${forumData.forumID} in category ${forumData.categoryID} as read.`,
      );
      markReadInvalidationKeys.map(key => {
        queryClient.invalidateQueries({queryKey: key});
      });
    }
  }, [forumData, queryClient, forumListData, markReadInvalidationKeys]);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    formikHelpers.setSubmitting(true);
    if (!data?.pages[0]) {
      formikHelpers.setSubmitting(false);
      return;
    }
    values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
    postCreateMutation.mutate(
      {
        forumID: data.pages[0].forumID,
        postData: values,
      },
      {
        onSuccess: async () => {
          formikHelpers.resetForm();
          // https://github.com/jocosocial/swiftarr/issues/237
          // https://github.com/jocosocial/swiftarr/issues/168
          // Refetch needed to "mark" the forum as read.
          // Also needed to load the data into the list.
          await refetch();
          if (data.pages[0]) {
            // This used to not include the forum itself. idk if that's a problem.
            // If it is, use otherInvalidationKeys.
            const invalidations = markReadInvalidationKeys.map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          }
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
          flatListRef.current?.scrollToEnd({animated: true});
        },
      },
    );
  };

  if (!data || isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  const getInitialScrollIndex = () => {
    // Inverted list means that we are starting from the bottom, so the
    // ISI (InitialScrollIndex) is meaningless.
    // console.log('### getInitialScrollIndex');
    // console.log('invert', invertList);
    // console.log('readCount', forumListData?.readCount);
    // console.log('postCount', forumListData?.postCount);
    if (invertList) {
      return undefined;
    }

    const loadedStartIndex = data.pages[0].paginator.start;
    // console.log('loadedStartIndex', loadedStartIndex);

    // The forum has been completely read
    if (forumListData && forumListData.readCount === forumListData.postCount) {
      return undefined;
    }
    // The forum has not been completely read. There is going to be a point in
    // the loaded data that we need to scroll to.
    // @TODO this is buggy. Getting an index that is the length. Worked around with the Math.max.
    // @TODO also can get value that is longer than the list
    if (forumListData && forumListData.readCount !== forumListData.postCount) {
      return Math.max(forumListData.readCount - loadedStartIndex - 1, 0);
    }

    // Default answer.
    return 0;
  };

  const showForm = !data.pages[0].isLocked || hasModerator;

  return (
    <AppView>
      <PostAsUserBanner />
      <ListTitleView title={data.pages[0].title} />
      {data.pages[0].isLocked && <ForumLockedView />}
      <ForumConversationList
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        forumData={data.pages[0]}
        hasPreviousPage={hasPreviousPage}
        // maintainViewPosition={maintainViewPosition}
        getListHeader={getListHeader}
        listRef={flatListRef}
        hasNextPage={hasNextPage}
        forumListData={forumListData}
        // initialScrollIndex={getInitialScrollIndex()}
        scrollButtonVerticalPosition={showForm ? 'raised' : 'bottom'}
      />
      {showForm && (
        <ContentPostForm
          onSubmit={onPostSubmit}
          formRef={postFormRef}
          enablePhotos={true}
          maxLength={2000}
          maxPhotos={4}
        />
      )}
    </AppView>
  );
};
