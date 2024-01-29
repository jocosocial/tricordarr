import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ForumData, ForumListData, PostContentData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import {ForumLockedView} from '../../../Views/Static/ForumLockedView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {ForumThreadScreenActionsMenu} from '../../../Menus/Forum/ForumThreadScreenActionsMenu';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {ListTitleView} from '../../../Views/ListTitleView';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {ContentPostForm} from '../../../Forms/ContentPostForm';
import {FormikHelpers, FormikProps} from 'formik';
import {useForumPostCreateMutation} from '../../../Queries/Forum/ForumPostQueries';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {PostAsUserBanner} from '../../../Banners/PostAsUserBanner';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useIsFocused} from '@react-navigation/native';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents, useCommonStack} from '../../../Navigation/CommonScreens';
import {InfiniteData, QueryObserverResult} from '@tanstack/react-query';

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
  getListHeader?: () => ReactNode;
  invertList?: boolean;
}
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
}: ForumThreadScreenBaseProps) => {
  const navigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts, forumListData, dispatchForumListData} = useTwitarr();
  const {profilePublicData} = useUserData();
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const postCreateMutation = useForumPostCreateMutation();
  const {setErrorMessage} = useErrorHandler();
  const flatListRef = useRef<FlatList<PostData>>(null);
  const {hasModerator} = usePrivilege();
  const isFocused = useIsFocused();
  const [forumListItem, setForumListItem] = useState<ForumListData>();
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => {
      if (forumListItem) {
        console.log('[ForumThreadScreenBase.tsx] Marking local ForumListItem as read.');
        setForumListItem({
          ...forumListItem,
          readCount: forumListItem.postCount,
        });
      }
      setRefreshing(false);
    });
  }, [forumListItem, refetch]);

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
          <ForumThreadScreenActionsMenu
            forumData={data.pages[0]}
            invalidationQueryKey={[`/forum/${data.pages[0].forumID}`]}
            onRefresh={onRefresh}
          />
        </HeaderButtons>
      </View>
    );
  }, [data?.pages, navigation, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages && isFocused) {
      const postListData = data.pages.flatMap(fd => fd.posts);
      console.log('[ForumThreadScreen.tsx] Setting ForumThreadPosts.');
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: invertList ? postListData.reverse() : postListData,
      });
      // This is a hack to get around unread counts on first load.
      // The spread operator is to ensure a copy of the object that doesn't update with the list
      // when the mark-as-read action occurs.
      // Only works if you came from ForumCategoriesScreen.
      if (!forumListItem) {
        let item = forumListData.find(fdl => fdl.forumID === data.pages[0].forumID);
        setForumListItem(item ? {...item} : undefined);
      }
    }
  }, [data, dispatchForumPosts, isFocused, setForumListItem, forumListData, forumListItem, invertList]);

  useEffect(() => {
    if (forumListItem) {
      console.log(`[ForumThreadScreen.tsx] Marking forum ${forumListItem.forumID} as read.`);
      dispatchForumListData({
        type: ForumListDataActions.markAsRead,
        forumID: forumListItem.forumID,
      });
    }
  }, [dispatchForumListData, forumListItem]);

  const onPostSubmit = (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
    formikHelpers.setSubmitting(true);
    if (!data?.pages[0]) {
      setErrorMessage('Forum Data missing? This is definitely a bug.');
      formikHelpers.setSubmitting(false);
      return;
    }
    values.text = replaceMentionValues(values.text, ({name}) => `@${name}`);
    // Mark as read if applicable.
    if (forumListItem) {
      setForumListItem({
        ...forumListItem,
        readCount: forumListItem.postCount,
      });
    }
    postCreateMutation.mutate(
      {
        forumID: data.pages[0].forumID,
        postData: values,
      },
      {
        onSuccess: response => {
          dispatchForumPosts({
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

  if (!data || isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <PostAsUserBanner />
      <ListTitleView title={data.pages[0].title} />
      {data.pages[0].isLocked && <ForumLockedView />}
      <ForumPostFlatList
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        invertList={invertList}
        forumData={data.pages[0]}
        hasPreviousPage={hasPreviousPage}
        maintainViewPosition={true}
        getListHeader={getListHeader}
        flatListRef={flatListRef}
        forumListData={forumListItem}
        hasNextPage={hasNextPage}
      />
      {(!data.pages[0].isLocked || hasModerator) && (
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
