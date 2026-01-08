import notifee from '@notifee/react-native';
import {useAppState} from '@react-native-community/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {Item} from 'react-navigation-header-buttons';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {TConversationListRef} from '#src/Components/Lists/ConversationList';
import {ChatFlatList} from '#src/Components/Lists/Fez/ChatFlatList';
import {FezChatScreenActionsMenu} from '#src/Components/Menus/Fez/FezChatScreenActionsMenu';
import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {FezMutedView} from '#src/Components/Views/Static/FezMutedView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {FezPostsActions, useFezPostsReducer} from '#src/Context/Reducers/Fez/FezPostsReducers';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {
  CommonStackComponents,
  CommonStackParamList,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/CommonScreens';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData, PostContentData} from '#src/Structs/ControllerStructs';
import {SocketFezMemberChangeData} from '#src/Structs/SocketStructs';

type Props = StackScreenProps<
  CommonStackParamList,
  | CommonStackComponents.lfgChatScreen
  | CommonStackComponents.seamailChatScreen
  | CommonStackComponents.privateEventChatScreen
>;

/**
 * Common screen for Fez chats. All features [Seamail, LFG, PrivateEvent] can
 * be enabled/disabled independently so the typing logic above is a bit different.
 */
export const FezChatScreen = (props: Props) => {
  const {route} = props;
  const routeName = route.name;

  // Determine feature and urlPath based on route name
  // Fallback (shouldn't happen)
  let feature: SwiftarrFeature = SwiftarrFeature.seamail;
  let urlPath: string = '/seamail';
  let helpScreen: HelpScreenComponents = CommonStackComponents.seamailHelpScreen;

  if (routeName === CommonStackComponents.seamailChatScreen) {
    feature = SwiftarrFeature.seamail;
    urlPath = '/seamail/${route.params.fezID}';
    helpScreen = CommonStackComponents.seamailHelpScreen;
  } else if (routeName === CommonStackComponents.lfgChatScreen) {
    feature = SwiftarrFeature.friendlyfez;
    urlPath = '/lfg/${route.params.fezID}';
    helpScreen = CommonStackComponents.lfgHelpScreen;
  } else if (routeName === CommonStackComponents.privateEventChatScreen) {
    feature = SwiftarrFeature.personalevents;
    urlPath = '/privateevent/${route.params.fezID}';
    helpScreen = CommonStackComponents.scheduleHelpScreen;
  }

  return (
    <PreRegistrationScreen helpScreen={helpScreen}>
      <DisabledFeatureScreen feature={feature} urlPath={urlPath}>
        <FezChatScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const FezChatScreenInner = ({route}: Props) => {
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
  const {setSnackbarPayload} = useSnackbar();
  const {fezSockets, openFezSocket, dispatchFezSockets, closeFezSocket} = useSocket();
  const navigation = useCommonStack();
  const queryClient = useQueryClient();
  const {appConfig} = useConfig();
  const appStateVisible = useAppState();
  const flatListRef = useRef<TConversationListRef>(null);
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
    const participants = fez.members?.participants;
    const canCreateEvent = FezType.isSeamailType(fez.fezType) && participants && participants.length > 0;

    return (
      <View>
        <MaterialHeaderButtons>
          {canCreateEvent && (
            <Item
              title={'Create Event'}
              iconName={AppIcons.eventCreate}
              onPress={() =>
                navigation.push(CommonStackComponents.personalEventCreateScreen, {
                  initialUserHeaders: participants,
                })
              }
            />
          )}
          <FezChatScreenActionsMenu fez={fez} onRefresh={onRefresh} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [fez, onRefresh, navigation]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      console.info('[FezChatScreen.tsx] fezSocketMessageHandler responding event', event);
      const socketMessage = JSON.parse(event.data);
      if ('joined' in socketMessage) {
        // Then it's SocketFezMemberChangeData
        const memberChangeData = socketMessage as SocketFezMemberChangeData;
        const changeActionString = memberChangeData.joined ? 'joined' : 'left';
        let changeString = `User ${memberChangeData.user.username} has ${changeActionString} the chat.`;
        setSnackbarPayload({message: changeString});
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
    [refetch, setSnackbarPayload],
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
      values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
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
              return queryClient.invalidateQueries({queryKey: key});
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
        fezPosts: [...data.pages.flatMap(page => page.members?.posts || [])],
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
    return () => {
      if (fez) {
        closeFezSocket(fez.fezID);
      }
    };
  }, [closeFezSocket, dispatchFezSockets, fez, fezSocketMessageHandler, fezSockets, openFezSocket]);

  const getFezHeaderTitle = useCallback(() => {
    if (fez) {
      const onPress = () =>
        navigation.push(CommonStackComponents.fezChatDetailsScreen, {
          fezID: fez.fezID,
        });
      return <NavHeaderTitle onPress={onPress} title={FezType.getChatTitle(fez.fezType)} />;
    }
  }, [fez, navigation]);

  // Navigation useEffect
  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      headerTitle: getFezHeaderTitle,
    });
  }, [getFezHeaderTitle, getNavButtons, navigation]);

  // Mark as Read useEffect
  useEffect(() => {
    console.log('[FezChatScreen.tsx] Mark As Read useEffect');
    if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
      // This does not invalidate the current key because that's how we determine
      // where the NEW marker goes.
      const invalidations = FezData.getCacheKeys().map(key => {
        return queryClient.invalidateQueries({queryKey: key});
      });
      Promise.all(invalidations);
      if (appConfig.markReadCancelPush) {
        console.log('[FezChatScreen.tsx] auto canceling notifications.');
        // This is a no-op on iOS. The system automatically dismisses notifications on press.
        notifee.cancelDisplayedNotification(fez.fezID);
      }
    }
  }, [fez, queryClient, appConfig.markReadCancelPush]);

  // Visible useEffect
  // Reload on so that when the user taps a Seamail notification while this screen is active in the background
  // it will update with the latest data. This refetches a little aggressively when coming from the background
  // so some day some debouncing should be implemented.
  useEffect(() => {
    const checkInitial = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification && appStateVisible === 'active') {
        await refetch();
      }
    };
    console.log('[FezChatScreen.tsx] Triggering appStateVisible useEffect', appStateVisible);
    checkInitial();
  }, [appStateVisible, refetch]);

  // When the screen unmounts, refetch the current Fez.
  // This doesn't do an invalidation so that the local data is fresh if the
  // user goes back in quickly. queryClient.invalidateQueries([`/fez/${fez.fezID}`]);
  // would be the invalidation.
  useEffect(() => {
    return () => {
      console.log('[FezChatScreen.tsx] useEffect return is running.');
      if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
        refetch();
      }
      refetchUserNotificationData();
    };
  }, [fez, refetch, refetchUserNotificationData]);

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
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
      />
      <ContentPostForm onSubmit={onSubmit} enablePhotos={false} />
    </AppView>
  );
};
