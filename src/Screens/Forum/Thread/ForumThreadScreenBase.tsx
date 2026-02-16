import {InfiniteData, QueryObserverResult} from '@tanstack/react-query';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {type TConversationListV2Ref} from '#src/Components/Lists/ConversationListV2';
import {ForumConversationListV2} from '#src/Components/Lists/Forums/ForumConversationListV2';
import {ForumThreadScreenActionsMenu} from '#src/Components/Menus/Forum/ForumThreadScreenActionsMenu';
import {ForumThreadPinnedPostsItem} from '#src/Components/Menus/Forum/Items/ForumThreadPinnedPostsItem';
import {ForumThreadSearchPostsItem} from '#src/Components/Menus/Forum/Items/ForumThreadSearchPostsItem';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ForumLockedView} from '#src/Components/Views/Static/ForumLockedView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumData} from '#src/Hooks/Forum/useForumData';
import {useMaxForumPostImages} from '#src/Hooks/useMaxForumPostImages';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumPostCreateMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useForumMarkReadMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {ForumData, ForumListData, PostContentData} from '#src/Structs/ControllerStructs';

const logger = createLogger('ForumThreadScreenBase.tsx');

interface Props {
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
  forumListData,
}: Props) => {
  const navigation = useCommonStack();
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const markReadMutation = useForumMarkReadMutation();
  const flatListRef = useRef<TConversationListV2Ref>(null);
  const {hasModerator} = usePrivilege();
  const maxForumPostImages = useMaxForumPostImages();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();
  const [readyToShow, setReadyToShow] = useState(false);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {data: profilePublicData} = useUserProfileQuery();

  // Derive unified ForumData from the React Query cache (no local state).
  const forumData = useForumData(data);
  const forumPosts = forumData?.posts ?? [];

  // Cache reducer -- operates directly on queryClient.
  const {appendPost, markRead} = useForumCacheReducer();

  // Mark forum as read in local caches when thread data loads.
  useEffect(() => {
    if (forumData) {
      if (forumListData && forumListData.readCount === forumListData.postCount) {
        return;
      }
      markRead(forumData.forumID, forumData.categoryID);
    }
  }, [forumData, forumListData, markRead]);

  const fullRefresh = useCallback(async () => {
    await refetch();
    // After refetch, the server may report more posts than we have pages for
    // (e.g. optimistically-added posts that crossed a page boundary).
    // fetchNextPage is a no-op when getNextPageParam returns undefined.
    await fetchNextPage();
  }, [refetch, fetchNextPage]);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: fullRefresh,
  });

  const {handleLoadNext, handleLoadPrevious} = usePagination({
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    setRefreshing,
  });

  const getNavButtons = useCallback(() => {
    if (!forumData) {
      return <></>;
    }

    return (
      <View>
        <MaterialHeaderButtons>
          {forumData.eventID && (
            <Item
              title={'Event'}
              iconName={AppIcons.events}
              onPress={() => navigation.push(CommonStackComponents.eventScreen, {eventID: forumData.eventID!})}
            />
          )}
          <ForumThreadPinnedPostsItem forumID={forumData.forumID} navigation={navigation} />
          <ForumThreadSearchPostsItem navigation={navigation} forum={forumData} />
          <ForumThreadScreenActionsMenu forumData={forumData} onRefresh={onRefresh} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [forumData, navigation, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    formikHelpers.setSubmitting(true);
    if (!forumData) {
      formikHelpers.setSubmitting(false);
      return;
    }
    values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
    postCreateMutation.mutate(
      {
        forumID: forumData.forumID,
        postData: values,
      },
      {
        onSuccess: response => {
          formikHelpers.resetForm();

          // Update React Query caches (instant, no network).
          // This triggers a re-render via the derived useForumData.
          if (profilePublicData) {
            appendPost(forumData.forumID, forumData.categoryID, response.data, profilePublicData.header);
          }

          // Clear server unread status (fire-and-forget).
          markReadMutation.mutate({forumID: forumData.forumID});

          // Scroll to the new post.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              flatListRef.current?.scrollToEnd({animated: false});
            });
          });
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
        },
      },
    );
  };

  const onReadyToShow = useCallback(() => {
    logger.debug('Forum thread list ready to show');
    setReadyToShow(true);
  }, []);

  if (!data || isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  const getInitialScrollIndex = () => {
    if (!forumListData || forumListData.readCount === forumListData.postCount) {
      // Fully read: scroll to the last post via initialScrollIndex.
      // We use this instead of scrollToEnd because scrollToEnd fires before
      // LegendList has fully laid out recycled content, causing it to land mid-list.
      return forumPosts.length > 0 ? forumPosts.length - 1 : undefined;
    }
    const loadedStart = forumData?.paginator.start ?? 0;
    const idx = Math.max(forumListData.readCount - loadedStart, 0);
    // Clamp to the loaded data range. readCount can exceed the loaded page
    // when only a subset of posts have been fetched.
    return Math.min(idx, forumPosts.length - 1);
  };

  const showForm = !forumData?.isLocked || hasModerator;

  const overlayStyles = StyleSheet.create({
    overlay: {
      ...commonStyles.positionAbsolute,
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      zIndex: 1,
    },
  });

  return (
    <AppView>
      <PostAsUserBanner />
      <ListTitleView title={forumData?.title ?? ''} />
      {forumData?.isLocked && <ForumLockedView />}
      <View style={commonStyles.flex}>
        <ForumConversationListV2
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          refreshControl={<AppRefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh} />}
          forumData={forumData}
          hasPreviousPage={hasPreviousPage}
          getListHeader={getListHeader}
          listRef={flatListRef}
          hasNextPage={hasNextPage}
          forumListData={forumListData}
          initialScrollIndex={getInitialScrollIndex()}
          onReadyToShow={onReadyToShow}
        />
        {!readyToShow && (
          <View style={overlayStyles.overlay}>
            <ActivityIndicator size={'large'} />
          </View>
        )}
      </View>
      {showForm && (
        <ContentPostForm
          onSubmit={onPostSubmit}
          formRef={postFormRef}
          enablePhotos={true}
          maxLength={2000}
          maxPhotos={maxForumPostImages}
        />
      )}
    </AppView>
  );
};
