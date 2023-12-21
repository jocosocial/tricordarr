import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ForumPostSearchQueryParams, useForumPostSearchQuery} from '../../../Queries/Forum/ForumPostSearchQueries';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../../Views/Modals/HelpModalView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {useForumStackNavigation} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ListTitleView} from '../../../Views/ListTitleView';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';

interface ForumPostScreenBaseProps {
  queryParams: ForumPostSearchQueryParams;
  refreshOnUserNotification?: boolean;
  title?: string;
}

export const forumPostHelpText = [
  'Long-press a post to favorite, edit, or add a reaction.',
  'Tapping on a post will take you to the posts forum to see it in context.',
  'Favoriting a post will save it to an easily accessible Personal Category on the Forums page.',
  'You can edit or delete your own forum posts.',
];

export const ForumPostScreenBase = ({queryParams, refreshOnUserNotification, title}: ForumPostScreenBaseProps) => {
  const {
    data,
    refetch,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    fetchNextPage,
    isLoading,
  } = useForumPostSearchQuery(queryParams);
  const navigation = useForumStackNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const {userNotificationData, refetchUserNotificationData} = useUserNotificationData();
  const {setModalContent, setModalVisible} = useModal();
  const flatListRef = useRef<FlatList<PostData>>(null);
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  const handleHelpModal = useCallback(() => {
    setModalContent(<HelpModalView text={forumPostHelpText} />);
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={onRefresh} />
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelpModal} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelpModal, onRefresh]);

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

  useEffect(() => {
    if (refreshOnUserNotification && userNotificationData?.newForumMentionCount) {
      onRefresh();
    }
  }, [onRefresh, refreshOnUserNotification, userNotificationData?.newForumMentionCount]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  // useEffect(() => {
  // if (!isFocused) {
  //   console.log('[ForumPostScreenBase.tsx] Clearing ForumPosts');
  //   dispatchForumPosts({
  //     type: ForumPostListActions.clear,
  //   });
  //   return;
  // }
  // }, [isFocused]);

  useEffect(() => {
    if (data) {
      console.log('[ForumPostScreenBase.tsx] Setting ForumPosts.');
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(p => p.posts),
      });
    }
    if (userNotificationData?.newForumMentionCount) {
      refetchUserNotificationData();
    }
  }, [data, dispatchForumPosts, refetchUserNotificationData, userNotificationData?.newForumMentionCount]);

  if (isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {title && <ListTitleView title={title} />}
      <ForumPostFlatList
        flatListRef={flatListRef}
        invertList={false}
        postList={forumPosts}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadPrevious={handleLoadPrevious}
        handleLoadNext={handleLoadNext}
        itemSeparator={'time'}
        enableShowInThread={true}
        hasNextPage={hasNextPage}
      />
    </AppView>
  );
};
