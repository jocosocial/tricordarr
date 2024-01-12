import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {FezPostListItem} from '../../Lists/Items/FezPostListItem';
import {SpaceDivider} from '../../Lists/Dividers/SpaceDivider';
import {SeamailActionsMenu} from '../../Menus/SeamailActionsMenu';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {ContentPostForm} from '../../Forms/ContentPostForm';
import {FormikHelpers} from 'formik';
import {Text} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {SocketFezMemberChangeData} from '../../../libraries/Structs/SocketStructs';
import {PostAsUserBanner} from '../../Banners/PostAsUserBanner';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {FezPostsActions} from '../../Reducers/Fez/FezPostsReducers';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {LabelDivider} from '../../Lists/Dividers/LabelDivider';
import {getSeamailHeaderTitle} from '../../Navigation/Components/SeamailHeaderTitle';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ListTitleView} from '../../Views/ListTitleView';
import {useQueryClient} from '@tanstack/react-query';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {FezMutedView} from '../../Views/Static/FezMutedView';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const {fez, setFez} = useTwitarr();
  const {commonStyles} = useStyles();
  const {fezSocket, openFezSocket} = useSocket();
  const fezPostMutation = useFezPostMutation();
  const {dispatchFezList, fezPostsData, dispatchFezPostsData} = useTwitarr();
  const {setErrorMessage} = useErrorHandler();
  const {refetchUserNotificationData} = useUserNotificationData();
  const queryClient = useQueryClient();

  const {
    data,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    // isError,
  } = useSeamailQuery({fezID: route.params.fezID});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      refetchUserNotificationData();
      setRefreshing(false);
    });
  }, [refetch, refetchUserNotificationData]);

  const getNavButtons = useCallback(() => {
    if (!fez) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={onRefresh} />
          <SeamailActionsMenu fez={fez} />
        </HeaderButtons>
      </View>
    );
  }, [fez, onRefresh]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data);
      if ('joined' in socketMessage) {
        // Then it's SocketFezMemberChangeData
        const memberChangeData = socketMessage as SocketFezMemberChangeData;
        const changeActionString = memberChangeData.joined ? 'joined' : 'left';
        let changeString = `User ${memberChangeData.user.username} has ${changeActionString} this seamail.`;
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
        console.log('[SeamailScreen.tsx] fezSocketMessageHandler performing refetch.')
        refetch();
        // if (socketFezPostData.author.userID !== profilePublicData.header.userID) {
        //   console.log('fezSocket appending', socketFezPostData);
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

  // This will always load all future pages. Hopefully this isn't a bad thing.
  if (hasNextPage) {
    handleLoadNext();
  }

  const onSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      values.text = replaceMentionValues(values.text, ({name}) => `@${name}`)
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: response => {
            formikHelpers.setSubmitting(false);
            formikHelpers.resetForm();
            dispatchFezPostsData({
              type: FezPostsActions.appendPost,
              fezPostData: response.data,
            });
            dispatchFezList({
              type: FezListActions.addSelfPost,
              fezID: route.params.fezID,
            });
          },
        },
      );
    },
    [fezPostMutation, route.params.fezID, dispatchFezPostsData, dispatchFezList],
  );

  // Initial set
  useEffect(() => {
    if (data) {
      dispatchFezPostsData({
        type: FezPostsActions.set,
        fezPosts: [...data.pages.flatMap(page => page.members?.posts || [])].reverse(),
      });
      setFez(data?.pages[0]);
    }
  }, [data, dispatchFezPostsData, setFez]);

  // Socket
  // Don't put anything else in this useEffect. The socket stuff can get a little over-excited
  // with rendering.
  useEffect(() => {
    if (fez) {
      let newSocket = openFezSocket(fez.fezID);
      if (fezSocket && newSocket) {
        console.log(`[SeamailScreen.tsx] Adding fezSocketMessageHandler to fezSocket for fez ${fez.fezID}`);
        fezSocket.addEventListener('message', fezSocketMessageHandler);
      }
    }
  }, [fez, fezSocket, fezSocketMessageHandler, openFezSocket]);

  // Navigation
  useEffect(() => {
    if (fez) {
      navigation.setOptions({
        headerRight: getNavButtons,
        headerTitle: getSeamailHeaderTitle(fez.fezID, fez.title),
      });
    } else {
      navigation.setOptions({
        headerTitle: 'Loading...',
      });
    }
  }, [fez, getNavButtons, navigation]);

  // Mark as Read
  useEffect(() => {
    if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
      dispatchFezList({
        type: FezListActions.markAsRead,
        fezID: fez.fezID,
      });
      // Allegedly this invalidates based on prefix, so this will have a side effect
      // of invalidating LFGs too. Shouldn't be a big deal.
      queryClient.invalidateQueries({queryKey: ['/fez/joined']});
      refetchUserNotificationData();
    }
  }, [dispatchFezList, fez, queryClient, refetchUserNotificationData]);

  const renderHeader = () => {
    return (
      <PaddedContentView padTop={true} invertVertical={true}>
        {!hasPreviousPage && (
          <Text variant={'labelMedium'}>You've reached the beginning of this Seamail conversation.</Text>
        )}
      </PaddedContentView>
    );
  };

  // Because of the inversion / up-is-down nonsense, we use scrollToOffset
  // rather than scrollToEnd.
  // useCallback() didn't change any number of renders
  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  // useCallback() didn't change any number of renders
  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  const showNewDivider = useCallback(
    (index: number) => {
      if (fez && fez.members) {
        if (fez.members.postCount === fez.members.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        return fez.members.postCount - index === fez.members.readCount + 1;
      }
    },
    [fez],
  );

  // This is kinda hax for the fezPostData below
  if (!fez) {
    return <LoadingView />;
  }

  // This is a big sketch. See below for more reasons why this is a thing.
  // https://www.reddit.com/r/reactjs/comments/rgyy68/can_somebody_help_me_understand_why_does_reverse/?rdt=33460
  // const fezPostData: FezPostData[] = [...fezPageData.pages.flatMap(page => page.members?.posts || [])].reverse();
  return (
    <AppView>
      <ListTitleView title={fez.title} />
      <PostAsUserBanner />
      {fez.members?.isMuted && <FezMutedView />}
      <FlatList
        ref={flatListRef}
        // I am not sure about the performance here. onScroll is great but fires A LOT.
        // onScrollBeginDrag={handleScroll}
        // onScrollEndDrag={handleScroll}
        onScroll={handleScroll}
        // This is dumb. Have to take the performance hit to allow selecting text.
        // https://github.com/facebook/react-native/issues/26264
        // Good thing selecting text isn't necessary anymore!
        // removeClippedSubviews={false}
        ItemSeparatorComponent={SpaceDivider}
        data={fezPostsData}
        // Inverted murders performance to the point of locking the app.
        // So we do a series of verticallyInverted, relying on a deprecated style prop.
        // https://github.com/facebook/react-native/issues/30034
        // inverted={true}
        style={commonStyles.verticallyInverted}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
        keyExtractor={(item: FezPostData) => String(item.postID)}
        // This is the Footer because of all the inversion crap. In our case,
        // footer renders at the top.
        ListFooterComponent={renderHeader}
        renderItem={({item, index, separators}) => (
          <PaddedContentView invertVertical={true} padBottom={false}>
            {showNewDivider(index) && <LabelDivider label={'New'} />}
            <FezPostListItem fezPost={item} index={index} separators={separators} fez={fez} />
          </PaddedContentView>
        )}
        // End is Start, Start is End.
        onEndReached={handleLoadPrevious}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} displayPosition={'raised'} />}
      <ContentPostForm onSubmit={onSubmit} enablePhotos={false} />
    </AppView>
  );
};
