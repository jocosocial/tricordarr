import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {FlatList, Keyboard, RefreshControl, View} from 'react-native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {SeamailActionsMenu} from '../../Menus/SeamailActionsMenu';
import {SocketFezMemberChangeData} from '../../../libraries/Structs/SocketStructs';
import {FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {FezPostsActions} from '../../Reducers/Fez/FezPostsReducers';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PostAsUserBanner} from '../../Banners/PostAsUserBanner';
import {SpaceDivider} from '../../Lists/Dividers/SpaceDivider';
import {LabelDivider} from '../../Lists/Dividers/LabelDivider';
import {FezPostListItem} from '../../Lists/Items/FezPostListItem';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {ContentPostForm} from '../../Forms/ContentPostForm';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';

export type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgChatScreen, NavigatorIDs.lfgStack>;

// @TODO this could really use some dedup with the SeamailScreen.
export const LfgChatScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const {lfg, setLfg} = useTwitarr();
  const {commonStyles} = useStyles();
  const {fezSocket, openFezSocket} = useSocket();
  const fezPostMutation = useFezPostMutation();
  const {dispatchLfgList, lfgPostsData, dispatchLfgPostsData} = useTwitarr();
  const {setErrorMessage} = useErrorHandler();
  const {refetchUserNotificationData} = useUserNotificationData();

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
    if (!lfg) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item title={'Reload'} iconName={AppIcons.reload} onPress={onRefresh} />
          <SeamailActionsMenu fez={lfg} enableDetails={false} />
        </HeaderButtons>
      </View>
    );
  }, [lfg, onRefresh]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
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
      Keyboard.dismiss();
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: response => {
            formikHelpers.setSubmitting(false);
            formikHelpers.resetForm();
            dispatchLfgPostsData({
              type: FezPostsActions.appendPost,
              fezPostData: response.data,
            });
            dispatchLfgList({
              type: FezListActions.addSelfPost,
              fezID: route.params.fezID,
            });
          },
        },
      );
    },
    [fezPostMutation, route.params.fezID, dispatchLfgPostsData, dispatchLfgList],
  );

  // Initial set
  useEffect(() => {
    if (data) {
      dispatchLfgPostsData({
        type: FezPostsActions.set,
        fezPosts: [...data.pages.flatMap(page => page.members?.posts || [])].reverse(),
      });
      setLfg(data?.pages[0]);
    }
  }, [data, dispatchLfgPostsData, setLfg]);

  // Socket
  // Don't put anything else in this useEffect. The socket stuff can get a little over-excited
  // with rendering.
  useEffect(() => {
    if (lfg) {
      openFezSocket(lfg.fezID);
      if (fezSocket) {
        fezSocket.addEventListener('message', fezSocketMessageHandler);
      }
    }
  }, [lfg, fezSocket, fezSocketMessageHandler, openFezSocket]);

  // Navigation
  useEffect(() => {
    if (lfg) {
      navigation.setOptions({
        headerRight: getNavButtons,
        headerTitle: lfg.title,
      });
    } else {
      navigation.setOptions({
        headerTitle: 'Loading...',
      });
    }
  }, [lfg, getNavButtons, navigation]);

  // Mark as Read
  useEffect(() => {
    if (lfg && lfg.members && lfg.members.readCount !== lfg.members.postCount) {
      console.info('Doing the fez thing');
      dispatchLfgList({
        type: FezListActions.markAsRead,
        fezID: lfg.fezID,
      });
      refetchUserNotificationData();
    }
  }, [dispatchLfgList, lfg, refetchUserNotificationData]);

  const renderHeader = () => {
    return (
      <PaddedContentView padTop={true} invertVertical={true}>
        {!hasPreviousPage && (
          <Text variant={'labelMedium'}>You've reached the beginning of this LFG conversation.</Text>
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
      if (lfg && lfg.members) {
        if (lfg.members.postCount === lfg.members.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        return lfg.members.postCount - index === lfg.members.readCount + 1;
      }
    },
    [lfg],
  );

  // This is kinda hax for the fezPostData below
  if (!lfg) {
    return <LoadingView />;
  }

  // This is a big sketch. See below for more reasons why this is a thing.
  // https://www.reddit.com/r/reactjs/comments/rgyy68/can_somebody_help_me_understand_why_does_reverse/?rdt=33460
  // const fezPostData: FezPostData[] = [...fezPageData.pages.flatMap(page => page.members?.posts || [])].reverse();
  return (
    <AppView>
      <PostAsUserBanner />
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
        data={lfgPostsData}
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
            <FezPostListItem fezPost={item} index={index} separators={separators} fez={lfg} />
          </PaddedContentView>
        )}
        // End is Start, Start is End.
        onEndReached={handleLoadPrevious}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} />}
      <ContentPostForm onSubmit={onSubmit} />
    </AppView>
  );
};
