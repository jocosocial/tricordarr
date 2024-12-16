import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';
import {FlatList, RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {FezChatActionsMenu} from '../../Menus/Fez/FezChatActionsMenu.tsx';
import {SocketFezMemberChangeData} from '../../../libraries/Structs/SocketStructs.ts';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {useSocket} from '../../Context/Contexts/SocketContext.ts';
import {getFezHeaderTitle} from '../../Navigation/Components/FezHeaderTitle.tsx';
import {CommonStackComponents, CommonStackParamList, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import notifee from '@notifee/react-native';
import {useAppState} from '@react-native-community/hooks';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {PostAsUserBanner} from '../../Banners/PostAsUserBanner.tsx';
import {FezMutedView} from '../../Views/Static/FezMutedView.tsx';
import {ChatFlatList} from '../../Lists/ChatFlatList.tsx';
import {ContentPostForm} from '../../Forms/ContentPostForm.tsx';
import {FezData, PostContentData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FormikHelpers} from 'formik';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {FezPostsActions, useFezPostsReducer} from '../../Reducers/Fez/FezPostsReducers.ts';
import {useFezPostMutation} from '../../Queries/Fez/FezPostMutations.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebSocketStorageActions} from '../../Reducers/Fez/FezSocketReducer.ts';

type Props = NativeStackScreenProps<
  CommonStackParamList,
  | CommonStackComponents.lfgChatScreen
  | CommonStackComponents.seamailChatScreen
  | CommonStackComponents.privateEventChatScreen
>;

/**
 * Common screen for Fez chats. All features [Seamail, LFG, PrivateEvent] can
 * be enabled/disabled independently so the typing logic above is a bit different.
 */
export const FezChatScreen = ({route}: Props) => {
  const {
    data,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useFezQuery({fezID: route.params.fezID});
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const fezPostMutation = useFezPostMutation();
  const [refreshing, setRefreshing] = useState(false);
  const {setErrorMessage} = useErrorHandler();
  const {fezSockets, openFezSocket, dispatchFezSockets} = useSocket();
  const navigation = useCommonStack();
  const queryClient = useQueryClient();
  const {appConfig} = useConfig();
  const appStateVisible = useAppState();
  const flatListRef = useRef<FlatList>(null);
  const [fez, setFez] = useState<FezData>();
  const [fezPostsData, dispatchFezPostsData] = useFezPostsReducer([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchUserNotificationData(), refetch()]);
    setRefreshing(false);
  }, [refetch, refetchUserNotificationData]);

  const getNavButtons = useCallback(() => {
    if (!fez) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <FezChatActionsMenu fez={fez} onRefresh={onRefresh} />
        </HeaderButtons>
      </View>
    );
  }, [fez, onRefresh]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      console.info('[FezChatScreen.tsx] fezSocketMessageHandler responding event', event);
      const socketMessage = JSON.parse(event.data);
      if ('joined' in socketMessage) {
        // Then it's SocketFezMemberChangeData
        const memberChangeData = socketMessage as SocketFezMemberChangeData;
        const changeActionString = memberChangeData.joined ? 'joined' : 'left';
        let changeString = `User ${memberChangeData.user.username} has ${changeActionString} this LFG.`;
        setErrorMessage(changeString);
      } else if ('postID' in socketMessage) {
        // Don't push our own posts via the socket.
        // const socketFezPostData = socketMessage as SocketFezPostData;
        // Apparently Swiftarr sends back a garbage timestamp?
        // Replace it with now since it's probably now-ish anyway and we can fix it
        // on reload.
        // socketFezPostData.timestamp = new Date();
        //  After all that, the server still considers the message unread until you do a GET containing it
        //  So dynamically putting messages to the screen will help the local state but that's it.
        //  And confuse any other client applications.
        refetch();
        // if (socketFezPostData.author.userID !== profilePublicData.header.userID) {
        //   dispatchFezPostsData({
        //     type: FezPostsActions.appendPost,
        //     fezPostData: socketFezPostData,
        //   });
        // }
      }
    },
    [refetch, setErrorMessage],
  );

  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => {
        setRefreshing(false);
      });
    }
  };

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => {
        setRefreshing(false);
      });
    }
  };

  // @TODO Disabling this since the new list component can dynamically load
  // in both directions
  // This will always load all future pages. Hopefully this isn't a bad thing.
  // if (hasNextPage) {
  //   handleLoadNext();
  // }

  const onSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      values.text = replaceMentionValues(values.text, ({name}) => `@${name}`);
      // Mark as read if applicable.
      if (fez && fez.members) {
        setFez({
          ...fez,
          members: {
            ...fez.members,
            readCount: fez.members.postCount,
          },
        });
      }
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: async response => {
            formikHelpers.resetForm();
            dispatchFezPostsData({
              type: FezPostsActions.appendPost,
              fezPostData: response.data,
            });
            // Mark stale so that it refetches with your new posts
            // Some day this should just update the query data.
            const invalidations = FezData.getCacheKeys(route.params.fezID).map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => formikHelpers.setSubmitting(false),
        },
      );
    },
    [fez, fezPostMutation, route.params.fezID, setFez, queryClient, dispatchFezPostsData],
  );

  // Initial set useEffect
  useEffect(() => {
    if (data) {
      dispatchFezPostsData({
        type: FezPostsActions.set,
        fezPosts: [...data.pages.flatMap(page => page.members?.posts || [])].reverse(),
      });
      setFez(data?.pages[0]);
    }
  }, [data, dispatchFezPostsData, setFez]);

  // Socket useEffect
  // Don't put anything else in this useEffect. The socket stuff can get a little over-excited
  // with rendering.
  useEffect(() => {
    const handleFezSocket = async () => {
      if (fez) {
        const newSocketInfo = await openFezSocket(fez.fezID);
        if (newSocketInfo.isNew && newSocketInfo.ws) {
          console.log(`[FezChatScreen.tsx] Adding handler to fezSocket for fez ${fez.fezID} (${fez.fezType})`);
          newSocketInfo.ws.addEventListener('message', fezSocketMessageHandler);
          dispatchFezSockets({
            type: WebSocketStorageActions.upsert,
            key: fez.fezID,
            socket: newSocketInfo.ws,
          });
        } else {
          console.log(`[FezChatScreen.tsx] Skipping fezSocket handler for fez ${fez.fezID} (${fez.fezType})`);
        }
      }
    };
    handleFezSocket();
  }, [dispatchFezSockets, fez, fezSocketMessageHandler, fezSockets, openFezSocket]);

  // Navigation useEffect
  useEffect(() => {
    if (fez) {
      navigation.setOptions({
        headerRight: getNavButtons,
        // Annoying there doesn't seem to be a way to access the current title
        // so the result of the function should match the navigator.
        headerTitle: getFezHeaderTitle(fez),
      });
    }
  }, [fez, getNavButtons, navigation]);

  // Mark as Read useEffect
  useEffect(() => {
    if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
      const invalidations = FezData.getCacheKeys().map(key => {
        return queryClient.invalidateQueries(key);
      });
      Promise.all(invalidations);
      if (appConfig.markReadCancelPush) {
        console.log('[FezChatScreen.tsx] auto canceling notifications.');
        notifee.cancelDisplayedNotification(fez.fezID);
      }
      refetchUserNotificationData();
    }
  }, [fez, queryClient, refetchUserNotificationData, appConfig.markReadCancelPush]);

  // Visible useEffect
  // Reload on so that when the user taps a Seamail notification while this screen is active in the background
  // it will update with the latest data. This refetches a little aggressively when coming from the background
  // so some day some debouncing should be implemented.
  useEffect(() => {
    if (appStateVisible === 'active') {
      refetch();
    }
  }, [appStateVisible, refetch]);

  // This is kinda hax for the fezPostData below
  if (!fez) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ListTitleView title={fez.title} />
      <PostAsUserBanner />
      {fez.members?.isMuted && <FezMutedView />}
      <ChatFlatList
        fez={fez}
        fezPostData={fezPostsData}
        flatListRef={flatListRef}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        scrollButtonPosition={'raised'}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
      />
      <ContentPostForm onSubmit={onSubmit} enablePhotos={false} />
    </AppView>
  );
};
