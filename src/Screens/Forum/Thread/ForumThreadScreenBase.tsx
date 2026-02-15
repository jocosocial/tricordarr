import {InfiniteData, QueryObserverResult, useQueryClient} from '@tanstack/react-query';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useMaxForumPostImages} from '#src/Hooks/useMaxForumPostImages';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumPostCreateMutation} from '#src/Queries/Forum/ForumPostMutations';
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
}: Props) => {
  const navigation = useCommonStack();
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const flatListRef = useRef<TConversationListV2Ref>(null);
  const {hasModerator} = usePrivilege();
  const maxForumPostImages = useMaxForumPostImages();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();
  const queryClient = useQueryClient();
  const [readyToShow, setReadyToShow] = useState(false);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  // Needed for useEffect checking.
  const forumData = data?.pages[0];
  // This should not expire the `/forum/:ID` data on mark-as-read because there is no read data in there
  // to care about. It's all in the category (ForumListData) queries.
  const markReadInvalidationKeys = ForumListData.getCacheKeys(data?.pages[0].categoryID);
  const otherInvalidationKeys = ForumListData.getCacheKeys(data?.pages[0].categoryID, data?.pages[0].forumID);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
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
    // Typescript struggles
    if (!data?.pages[0]) {
      return <></>;
    }
    const eventID = data.pages[0].eventID;

    return (
      <View>
        <MaterialHeaderButtons>
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
        </MaterialHeaderButtons>
      </View>
    );
  }, [data?.pages, otherInvalidationKeys, navigation, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const forumPosts = useMemo(() => {
    if (data && data.pages) {
      return data.pages.flatMap(fd => fd.posts);
    }
    return [];
  }, [data]);

  useEffect(() => {
    if (forumData) {
      if (forumListData && forumListData.readCount === forumListData.postCount) {
        logger.debug(`Forum ${forumData.forumID} has already been read.`);
        return;
      }
      logger.debug(`Marking forum ${forumData.forumID} in category ${forumData.categoryID} as read.`);
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
            // Wait for the next render cycle to ensure the new post is rendered before scrolling.
            // Had an issue where the new post was not coming into view after it was made.
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                flatListRef.current?.scrollToEnd({animated: false});
              });
            });
          }
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
          // flatListRef.current?.scrollToIndex({index: forumPosts.length - 1, animated: true});
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
    const loadedStart = data.pages[0].paginator.start;
    const idx = Math.max(forumListData.readCount - loadedStart, 0);
    // Clamp to the loaded data range. readCount can exceed the loaded page
    // when only a subset of posts have been fetched.
    return Math.min(idx, forumPosts.length - 1);
  };

  const showForm = !data.pages[0].isLocked || hasModerator;

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
      <ListTitleView title={data.pages[0].title} />
      {data.pages[0].isLocked && <ForumLockedView />}
      <View style={commonStyles.flex}>
        <ForumConversationListV2
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          refreshControl={<AppRefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh} />}
          forumData={data.pages[0]}
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
