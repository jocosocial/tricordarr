import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {type TChatListRef} from '#src/Components/Lists/ChatList';
import {FezConversationListV2} from '#src/Components/Lists/Fez/FezConversationListV2';
import {FezChatScreenActionsMenu} from '#src/Components/Menus/Fez/FezChatScreenActionsMenu';
import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {FezMutedView} from '#src/Components/Views/Static/FezMutedView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {PostAsUserWarningView} from '#src/Components/Views/Warnings/PostAsUserWarningView';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ElevationProvider} from '#src/Context/Providers/ElevationProvider';
import {WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezData, useMarkFezReadEffect} from '#src/Hooks/Fez/useFezData';
import {useKeyboardVerticalOffset} from '#src/Hooks/Keyboard/useKeyboardVerticalOffset';
import {useFirstDefined} from '#src/Hooks/useFirstDefined';
import {useLatestRef} from '#src/Hooks/useLatestRef';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {getFezInitialScrollIndex} from '#src/Libraries/ChatList/InitialScroll';
import {createLogger} from '#src/Libraries/Logger';
import {openFezParentScreen} from '#src/Libraries/Navigation';
import {
  CommonStackComponents,
  CommonStackParamList,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {lfgJoinedListScrollFilter, LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {type FezPostData, type PostContentData} from '#src/Structs/ControllerStructs';
import {SocketFezMemberChangeData, SocketFezPostData} from '#src/Structs/SocketStructs';

const logger = createLogger('FezChatScreen.tsx');

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

  // Only seamail routes carry elevation state.
  const initialElevation =
    routeName === CommonStackComponents.seamailChatScreen
      ? (route.params as CommonStackParamList[CommonStackComponents.seamailChatScreen]).asPrivilegedUser
      : undefined;

  return (
    <PreRegistrationScreen helpScreen={helpScreen}>
      <DisabledFeatureScreen feature={feature} urlPath={urlPath}>
        <ElevationProvider initialElevation={initialElevation}>
          <FezChatScreenInner {...props} />
        </ElevationProvider>
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const FezChatScreenInner = ({route}: Props) => {
  const {asModerator, asTwitarrTeam} = useElevation();
  const {
    fezData: fez,
    fezPages,
    postDayCount,
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
  } = useFezData({fezID: route.params.fezID, initialReadCountHint: route.params.initialReadCount});
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  useMarkFezReadEffect(fez, initialReadCount);
  const fezPostMutation = useFezPostMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {openFezSocket, dispatchFezSockets, closeFezSocket} = useSocket();
  const navigation = useCommonStack();
  const {appendPost: appendPostToCache, markRead} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const flatListRef = useRef<TChatListRef<FezPostData>>(null);
  const fezSocketWithHandlerRef = useRef<{
    ws: ReconnectingWebSocket;
    handler: (e: WebSocketMessageEvent) => void;
  } | null>(null);
  const lastProcessedPostIDRef = useRef<number | null>(null);
  // Flattened straight from the query pages. Derived rather than copied into state so the list never
  // sees an empty first render. De-duped by postID (first occurrence wins) because the socket append
  // and a page refetch can briefly both carry the same post.
  const fezPostsData = useMemo(() => {
    const seen = new Set<number>();
    return fezPages
      .flatMap(page => page.members?.posts || [])
      .filter(post => {
        if (seen.has(post.postID)) {
          return false;
        }
        seen.add(post.postID);
        return true;
      });
  }, [fezPages]);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: useCallback(async () => {
      await Promise.all([refetchUserNotificationData(), refetch()]);
    }, [refetch, refetchUserNotificationData]),
    isRefreshing: isFetching,
  });

  /**
   * Reload from the actions menu. Besides refetching, drops the frozen read count so a stale
   * "New" divider clears. Pull-to-refresh deliberately leaves it alone.
   */
  const onMenuReload = useCallback(async () => {
    await onRefresh();
    resetInitialReadCount();
  }, [onRefresh, resetInitialReadCount]);

  const getNavButtons = useCallback(() => {
    if (!fez) {
      return <></>;
    }
    const participants = fez.members?.participants;
    const canCreateEvent = FezType.isSeamailType(fez.fezType) && participants && participants.length > 0;
    const isLfg = FezType.isLFGType(fez.fezType);
    const isPrivateEvent = fez.fezType === FezType.privateEvent;

    return (
      <View>
        <MaterialHeaderButtons>
          {(isLfg || isPrivateEvent) && (
            <Item
              title={isLfg ? 'LFG' : 'Event'}
              iconName={isLfg ? AppIcons.lfg : AppIcons.personalEvent}
              onPress={() => openFezParentScreen(navigation, fez)}
            />
          )}
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
          <FezChatScreenActionsMenu fezID={route.params.fezID} onRefresh={onMenuReload} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [fez, onMenuReload, navigation, route.params.fezID]);

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
        if (lastProcessedPostIDRef.current === socketFezPostData.postID) {
          return;
        }
        lastProcessedPostIDRef.current = socketFezPostData.postID;
        // Include self-authored posts so other devices of the same user stay in
        // sync. appendPost is idempotent, so the posting device does not double-apply.
        appendPostToCache(route.params.fezID, socketFezPostData);
      }
    },
    [appendPostToCache, route.params.fezID, setSnackbarPayload],
  );
  const fezSocketMessageHandlerRef = useLatestRef(fezSocketMessageHandler);

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

  /**
   * Posts to the fez and resets the composer, keeping the current elevation flags.
   *
   * Awaits the mutation so Formik holds isSubmitting (and the submit button stays disabled)
   * for the full round trip. See #533.
   */
  const onSubmit = useCallback(
    async (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
      // Mark as read if applicable.
      if (fez && fez.members) {
        markRead(fez.fezID);
      }
      try {
        const response = await fezPostMutation.mutateAsync({
          fezID: route.params.fezID,
          postContentData: values,
        });
        formikHelpers.resetForm({
          values: {
            text: '',
            images: [],
            postAsModerator: asModerator,
            postAsTwitarrTeam: asTwitarrTeam,
          },
        });
        appendPostToCache(route.params.fezID, response.data);
        resetInitialReadCount();
        dispatchScrollToTop(LfgStackComponents.lfgListScreen, lfgJoinedListScrollFilter);
      } catch (error) {
        // The error snackbar is raised by useTokenAuthMutation's onError. Swallow here so the
        // rejection doesn't escape into Formik's submit handling.
        logger.error('Fez post create failed.', error);
      }
    },
    [
      fez,
      markRead,
      fezPostMutation,
      route.params.fezID,
      appendPostToCache,
      resetInitialReadCount,
      dispatchScrollToTop,
      asModerator,
      asTwitarrTeam,
    ],
  );

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
  }, [fezID, closeFezSocket, dispatchFezSockets, fezSocketMessageHandlerRef, openFezSocket]);

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

  // 20260308 The query now refetches on mount by default, so there is no effect here to reload when the
  // user taps a Seamail notification while this screen is active in the background.

  const [readyToShow, setReadyToShow] = useState(false);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const keyboardVerticalOffset = useKeyboardVerticalOffset();

  const onReadyToShow = useCallback(() => {
    logger.debug('Fez chat list ready to show');
    setReadyToShow(true);
  }, []);

  // Frozen once computable so later page loads and reads don't move the anchor; the list is
  // remounted via `key` when the index first becomes known, because FlashList only honors its
  // initial scroll position at mount. Computed above the early return below so the hook runs
  // on every render.
  const computedScrollIndex = fez ? getFezInitialScrollIndex(fez, fezPostsData.length, initialReadCount) : undefined;
  const frozenScrollIndex = useFirstDefined(
    computedScrollIndex !== undefined && computedScrollIndex >= 0 ? computedScrollIndex : undefined,
  );
  const initialScrollIndex = frozenScrollIndex ?? computedScrollIndex;

  // This is kinda hax for the fezPostData below
  if (!fez) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

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
    keyboardView: {
      ...commonStyles.flex,
    },
  });

  return (
    <AppView>
      <ListTitleView title={fez.title} />
      <PostAsUserWarningView />
      {fez.members?.isMuted && <FezMutedView />}
      <KeyboardAvoidingView
        style={overlayStyles.keyboardView}
        behavior={'padding'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
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
            postDayCount={postDayCount}
            onReadyToShow={onReadyToShow}
          />
          {!readyToShow && (
            <View style={overlayStyles.overlay}>
              <ActivityIndicator size={'large'} />
            </View>
          )}
        </View>
        <ContentPostForm onSubmit={onSubmit} enablePhotos={!FezType.isSeamailType(fez.fezType)} maxPhotos={1} />
      </KeyboardAvoidingView>
    </AppView>
  );
};
