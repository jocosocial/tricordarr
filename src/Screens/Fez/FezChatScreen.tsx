import notifee from '@notifee/react-native';
import {useAppState} from '@react-native-community/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {type TConversationListV2Ref} from '#src/Components/Lists/ConversationListV2';
import {FezConversationListV2} from '#src/Components/Lists/Fez/FezConversationListV2';
import {FezChatScreenActionsMenu} from '#src/Components/Menus/Fez/FezChatScreenActionsMenu';
import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {FezMutedView} from '#src/Components/Views/Static/FezMutedView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezPostsActions, useFezPostsReducer} from '#src/Context/Reducers/Fez/FezPostsReducers';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFez} from '#src/Hooks/useFez';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {createLogger} from '#src/Libraries/Logger';
import {
  CommonStackComponents,
  CommonStackParamList,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/CommonScreens';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {type FezData, type FezPostData, type PostContentData} from '#src/Structs/ControllerStructs';
import {SocketFezMemberChangeData, SocketFezPostData} from '#src/Structs/SocketStructs';

const logger = createLogger('FezChatScreen.tsx');

const getInitialScrollIndex = (fez: FezData, fezPostsData: FezPostData[], initialReadCount?: number) => {
  const readCount = initialReadCount ?? fez.members?.readCount;
  if (!fez.members || readCount === undefined || readCount === fez.members.postCount) {
    return fezPostsData.length > 0 ? fezPostsData.length - 1 : undefined;
  }
  const loadedStart = fez.members.paginator.start;
  const idx = Math.max(readCount - loadedStart, 0);
  // Clamp to the loaded data range. readCount can exceed the loaded page
  // when only a subset of posts have been fetched.
  return Math.min(idx, fezPostsData.length - 1);
};

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
    fezData: fez,
    fezPages,
    initialReadCount,
    resetInitialReadCount,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
  } = useFez({fezID: route.params.fezID});
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const fezPostMutation = useFezPostMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {currentUserID} = useSession();
  const {openFezSocket, dispatchFezSockets, closeFezSocket} = useSocket();
  const navigation = useCommonStack();
  const {appendPost: appendPostToCache, markRead} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {appConfig} = useConfig();
  const appStateVisible = useAppState();
  const flatListRef = useRef<TConversationListV2Ref>(null);
  const fezSocketWithHandlerRef = useRef<{
    ws: ReconnectingWebSocket;
    handler: (e: WebSocketMessageEvent) => void;
  } | null>(null);
  const fezSocketMessageHandlerRef = useRef<(event: WebSocketMessageEvent) => void>(() => {});
  const [fezPostsData, dispatchFezPostsData] = useFezPostsReducer([]);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: useCallback(async () => {
      await Promise.all([refetchUserNotificationData(), refetch()]);
    }, [refetch, refetchUserNotificationData]),
    isRefreshing: isFetching,
  });

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
          <FezChatScreenActionsMenu fezID={route.params.fezID} onRefresh={onRefresh} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [fez, onRefresh, navigation, route.params.fezID]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      logger.info('fezSocketMessageHandler responding event', event);
      const socketMessage = JSON.parse(event.data);
      if ('joined' in socketMessage) {
        const memberChangeData = socketMessage as SocketFezMemberChangeData;
        const changeActionString = memberChangeData.joined ? 'joined' : 'left';
        const changeString = `User ${memberChangeData.user.username} has ${changeActionString} the chat.`;
        setSnackbarPayload({message: changeString});
      } else if ('postID' in socketMessage) {
        const socketFezPostData = socketMessage as SocketFezPostData;
        if (currentUserID != null && socketFezPostData.author.userID !== currentUserID) {
          appendPostToCache(route.params.fezID, socketFezPostData);
        }
      }
    },
    [appendPostToCache, currentUserID, route.params.fezID, setSnackbarPayload],
  );
  fezSocketMessageHandlerRef.current = fezSocketMessageHandler;

  const {handleLoadNext, handleLoadPrevious} = usePagination({
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    setRefreshing,
  });

  // Proactively fetch the next page when it exists. In a real-time chat, new
  // messages arriving via socket can push past a page boundary. The user is at
  // the bottom so onEndReached won't fire — we need to fetch explicitly.
  useEffect(() => {
    if (hasNextPage) {
      handleLoadNext();
    }
  }, [hasNextPage, handleLoadNext]);

  const onSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
      // Mark as read if applicable.
      if (fez && fez.members) {
        markRead(fez.fezID);
      }
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: response => {
            formikHelpers.resetForm();
            appendPostToCache(route.params.fezID, response.data);
            dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          },
          onSettled: () => formikHelpers.setSubmitting(false),
        },
      );
    },
    [fez, markRead, fezPostMutation, route.params.fezID, appendPostToCache, dispatchScrollToTop],
  );

  // Initial set useEffect
  useEffect(() => {
    dispatchFezPostsData({
      type: FezPostsActions.set,
      fezPosts: [...fezPages.flatMap(page => page.members?.posts || [])],
    });
  }, [fezPages, dispatchFezPostsData]);

  // Socket useEffect: open/attach once per fezID (route param). Cleanup removes listener and
  // closes only on unmount or fezID change. Handler is read from a ref so message updates
  // do not retrigger this effect and create duplicate sockets.
  const fezID = route.params.fezID;
  useEffect(() => {
    let cancelled = false;
    const attachSocket = async () => {
      const socketInfo = await openFezSocket(fezID);
      if (cancelled || !socketInfo.ws) {
        if (socketInfo.ws) {
          socketInfo.ws.close();
        }
        return;
      }
      const wrapper = (e: WebSocketMessageEvent) => fezSocketMessageHandlerRef.current?.(e);
      socketInfo.ws.addEventListener('message', wrapper);
      fezSocketWithHandlerRef.current = {ws: socketInfo.ws, handler: wrapper};
      if (socketInfo.isNew) {
        dispatchFezSockets({
          type: WebSocketStorageActions.upsert,
          key: fezID,
          socket: socketInfo.ws,
        });
      }
      logger.debug(`Fez socket attached for fez ${fezID} (isNew: ${socketInfo.isNew})`);
    };
    attachSocket();
    return () => {
      const current = fezSocketWithHandlerRef.current;
      if (current) {
        current.ws.removeEventListener('message', current.handler);
        fezSocketWithHandlerRef.current = null;
      }
      closeFezSocket(fezID);
    };
  }, [fezID, closeFezSocket, dispatchFezSockets, openFezSocket]);

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
  // Fire when detail has unread, or when initialReadCount (from list cache) indicates unread
  // even if the detail GET already marked as read on the server.
  useEffect(() => {
    logger.debug('Mark As Read useEffect');
    if (fez && fez.members) {
      const hasUnread =
        fez.members.readCount !== fez.members.postCount ||
        (initialReadCount !== undefined && initialReadCount < fez.members.postCount);
      if (hasUnread) {
        markRead(fez.fezID);
        resetInitialReadCount();
        if (appConfig.markReadCancelPush) {
          logger.debug('auto canceling notifications.');
          notifee.cancelDisplayedNotification(fez.fezID);
        }
      }
    }
  }, [fez, markRead, initialReadCount, resetInitialReadCount, appConfig.markReadCancelPush]);

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
    logger.debug('Triggering appStateVisible useEffect', appStateVisible);
    checkInitial();
  }, [appStateVisible, refetch]);

  // When the screen unmounts, refetch the current Fez.
  // This doesn't do an invalidation so that the local data is fresh if the
  // user goes back in quickly. queryClient.invalidateQueries([`/fez/${fez.fezID}`]);
  // would be the invalidation.
  //
  // 20260225 Disabling this because I don't think we need it anymore with all of the
  // local state mutation stuff.
  // useEffect(() => {
  //   return () => {
  //     logger.debug('useEffect return is running.');
  //     if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
  //       refetch();
  //     }
  //     refetchUserNotificationData();
  //   };
  // }, [fez, refetch, refetchUserNotificationData]);

  const [readyToShow, setReadyToShow] = useState(false);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const onReadyToShow = useCallback(() => {
    logger.debug('Fez chat list ready to show');
    setReadyToShow(true);
  }, []);

  // This is kinda hax for the fezPostData below
  if (!fez) {
    return <LoadingView />;
  }

  const initialScrollIndex = getInitialScrollIndex(fez, fezPostsData, initialReadCount);
  const listKey = `${fez.fezID}-${initialScrollIndex ?? 'bottom'}`;

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
      <ListTitleView title={fez.title} />
      <PostAsUserBanner />
      {fez.members?.isMuted && <FezMutedView />}
      <View style={commonStyles.flex}>
        <FezConversationListV2
          key={listKey}
          fez={fez}
          fezPostData={fezPostsData}
          listRef={flatListRef}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
          initialScrollIndex={initialScrollIndex}
          initialReadCount={initialReadCount}
          onReadyToShow={onReadyToShow}
        />
        {!readyToShow && (
          <View style={overlayStyles.overlay}>
            <ActivityIndicator size={'large'} />
          </View>
        )}
      </View>
      <ContentPostForm onSubmit={onSubmit} enablePhotos={false} />
    </AppView>
  );
};
