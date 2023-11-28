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
  } = useForumThreadQuery(route.params.forumID);
  const [refreshing, setRefreshing] = useState(false);
  const [postList, setPostList] = useState<PostData[]>([]);
  const [forumData, setForumData] = useState<ForumData>();
  const rootNavigation = useRootStack();
  const {profilePublicData} = useUserData();
  const relationMutation = useForumRelationMutation();
  const theme = useAppTheme();

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

  const handleFavorite = () => {
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
  };

  const handleMute = () => {
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
  };

  const getNavButtons = useCallback(() => {
    // Typescript struggles
    if (!forumData) {
      return <></>;
    }
    const eventID = forumData?.eventID;

    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
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
          {forumData.creator.userID === profilePublicData?.header.userID && (
            <Item title={'Edit'} iconName={AppIcons.forumEdit} />
          )}
          <Item
            title={'Favorite'}
            color={forumData.isFavorite ? theme.colors.twitarrYellow : undefined}
            iconName={forumData.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
            onPress={handleFavorite}
          />
          <Item
            title={'Mute'}
            color={forumData.isMuted ? theme.colors.twitarrNegativeButton : undefined}
            iconName={forumData.isMuted ? AppIcons.mute : AppIcons.unmute}
            onPress={handleMute}
          />
          <ForumThreadActionsMenu forumData={forumData} />
        </HeaderButtons>
      </View>
    );
  }, [forumData, profilePublicData?.header.userID, rootNavigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      setPostList(data.pages.flatMap(forumData => forumData.posts).reverse());
      setForumData(data.pages[0]);
    }
  }, [data]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {forumData?.isLocked && <ForumLockedView />}
      <ForumPostFlatList
        postList={postList}
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
