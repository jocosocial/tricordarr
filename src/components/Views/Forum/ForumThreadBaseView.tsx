import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {
  BottomTabComponents,
  EventStackComponents,
  RootStackComponents,
} from '../../../libraries/Enums/Navigation';
import {ForumData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../Lists/Forums/ForumPostFlatList';
import {ForumLockedView} from '../../Views/Static/ForumLockedView';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ForumThreadActionsMenu} from '../../Menus/Forum/ForumThreadActionsMenu';
import {useForumRelationMutation} from '../../Queries/Forum/ForumRelationQueries';
import {useAppTheme} from '../../../styles/Theme';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {ForumTitleView} from '../../Views/ForumTitleView';
import {InfiniteData} from '@tanstack/react-query';

interface ForumThreadBaseViewProps {
  data?: InfiniteData<ForumData>;
  refetch: () => Promise<void>;
  isLoading: boolean;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export const ForumThreadBaseView = ({
  data,
  refetch,
  isLoading,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingPreviousPage,
  isFetchingNextPage,
  hasNextPage,
  hasPreviousPage,
}: ForumThreadBaseViewProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const [forumData, setForumData] = useState<ForumData>();
  const rootNavigation = useRootStack();
  const {profilePublicData} = useUserData();
  const relationMutation = useForumRelationMutation();
  const theme = useAppTheme();
  const navigation = useForumStackNavigation();
  const flatListRef = useRef<FlatList<PostData>>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
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

  const handleFavorite = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'favorite',
          action: forumData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isFavorite: !forumData.isFavorite,
            });
            // @TODO update list
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [forumData, relationMutation]);

  const handleMute = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'mute',
          action: forumData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isMuted: !forumData.isMuted,
            });
            // @TODO update list
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [forumData, relationMutation]);

  const getNavButtons = useCallback(() => {
    // Typescript struggles
    if (!forumData) {
      return <></>;
    }
    const eventID = forumData?.eventID;

    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={onRefresh} />
          {eventID && (
            <Item
              title={'Event'}
              iconName={AppIcons.events}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.scheduleTab,
                  params: {
                    screen: EventStackComponents.eventScreen,
                    initial: false,
                    params: {
                      eventID: eventID,
                    },
                  },
                })
              }
            />
          )}
          <Item
            title={'Favorite'}
            color={forumData.isFavorite ? theme.colors.twitarrYellow : undefined}
            iconName={AppIcons.favorite}
            onPress={handleFavorite}
          />
          {forumData.creator.userID !== profilePublicData?.header.userID && (
            <Item
              title={'Mute'}
              color={forumData.isMuted ? theme.colors.twitarrNegativeButton : undefined}
              iconName={AppIcons.mute}
              onPress={handleMute}
            />
          )}
          <ForumThreadActionsMenu forumData={forumData} />
        </HeaderButtons>
      </View>
    );
  }, [
    forumData,
    handleFavorite,
    handleMute,
    onRefresh,
    profilePublicData?.header.userID,
    rootNavigation,
    theme.colors.twitarrNegativeButton,
    theme.colors.twitarrYellow,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(fd => fd.posts).reverse(),
      });
      setForumData(data.pages[0]);
    }
  }, [data, dispatchForumPosts]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {forumData?.isLocked && <ForumLockedView />}
      <ForumTitleView title={forumData?.title} />
      <ForumPostFlatList
        flatListRef={flatListRef}
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh || isLoading} />}
        invertList={true}
        forumData={forumData}
        hasPreviousPage={hasPreviousPage}
        maintainViewPosition={true}
      />
    </AppView>
  );
};
