import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {useForumThreadQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {
  BottomTabComponents,
  EventStackComponents,
  ForumStackComponents,
  NavigatorIDs,
  RootStackComponents,
} from '../../../libraries/Enums/Navigation';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
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
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadScreen = ({route, navigation}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID, route.params.postID);
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts, dispatchForumListData} = useTwitarr();
  const [forumData, setForumData] = useState<ForumData>();
  const rootNavigation = useRootStack();
  const {profilePublicData} = useUserData();
  const relationMutation = useForumRelationMutation();
  const theme = useAppTheme();
  const startScreenAtBottom = !route.params.postID;

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
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: forumData.isMuted,
              isFavorite: !forumData.isFavorite,
            });
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
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: !forumData.isMuted,
              isFavorite: forumData.isFavorite,
            });
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
      const postListData = data.pages.flatMap(fd => fd.posts)
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: startScreenAtBottom ? postListData.reverse() : postListData,
      });
      setForumData(data.pages[0]);
    }
  }, [data, dispatchForumPosts, route.params.postID]);

  if (!data) {
    return <LoadingView />;
  }

  const headerText = route.params.postID ? 'Showing forum starting at selected post.' : undefined;

  return (
    <AppView>
      {forumData?.isLocked && <ForumLockedView />}
      <ForumTitleView title={forumData?.title} />
      <ForumPostFlatList
        postList={forumPosts}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh || isLoading} />}
        invertList={startScreenAtBottom}
        forumData={forumData}
        hasPreviousPage={hasPreviousPage}
        maintainViewPosition={true}
        headerText={headerText}
      />
    </AppView>
  );
};
