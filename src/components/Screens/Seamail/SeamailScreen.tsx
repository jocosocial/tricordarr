import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useInfiniteQuery, useMutation, UseMutationResult} from '@tanstack/react-query';
import {ErrorResponse, FezData, FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {FezPostListItem} from '../../Lists/Items/FezPostListItem';
import {SpaceDivider} from '../../Lists/Dividers/SpaceDivider';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {SeamailActionsMenu} from '../../Menus/SeamailActionsMenu';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezPostForm} from '../../Forms/FezPostForm';
import {FormikHelpers} from 'formik';
import {Text} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {SocketFezPostData} from '../../../libraries/Structs/SocketStructs';
import {FezPostAsUserBanner} from '../../Banners/FezPostAsUserBanner';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {useSocket} from '../../Context/Contexts/SocketContext';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const {fez, setFez, markFezRead, setFezPageData, fezPageData} = useTwitarr();
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {fezSocket, closeFezSocket, openFezSocket} = useSocket();
  const fezPostMutation = useFezPostMutation();

  console.log('vvv Starting Rendering');

  const {
    data,
    refetch,
    // fetchNextPage,
    fetchPreviousPage,
    // hasNextPage,
    hasPreviousPage,
    // isFetchingNextPage,
    isFetchingPreviousPage,
    // isError,
  } = useSeamailQuery({fezID: route.params.fezID});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    if (!fez) {
      return <></>;
    }
    return (
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton icon={AppIcons.reload} onPress={onRefresh} />
        <SeamailActionsMenu fez={fez} />
      </View>
    );
  }, [commonStyles, fez, onRefresh]);

  const fezSocketMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketFezPostData = JSON.parse(event.data) as SocketFezPostData;
      console.info('[fezSocket] Message received!', socketFezPostData);
      // Don't push our own posts via the socket.
      if (socketFezPostData.author.userID !== profilePublicData.header.userID) {
        onRefresh();
      }
    },
    [onRefresh, profilePublicData],
  );

  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => {
        setRefreshing(false);
      });
    }
  };

  const pushPostToScreen = useCallback(
    (fezPostData: FezPostData | SocketFezPostData) => {
      // As the paginator moves, the array ordering is also changed.
      // Slice returns a copy, and there's no Array.last property :(
      data?.pages[data?.pages.length - 1].members?.posts?.push(fezPostData);
    },
    [data?.pages],
  );

  const onSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: response => {
            formikHelpers.setSubmitting(false);
            formikHelpers.resetForm();
            pushPostToScreen(response.data);
            // data?.pages[data?.pages.length - 1].members?.posts?.push(response.data);
          },
        },
      );
    },
    [fezPostMutation, pushPostToScreen, route.params.fezID],
  );

  useEffect(() => {
    console.log('%%% SeamailScreen::useEffect::Navigation');
    // Set provider data
    // This is triggering an unmount/mount of the SeamailListScreen.
    // Not sure if it's a problem yet.
    setFezPageData(data);
    setFez(data?.pages[0]);

    if (fez && fez.members && fez.members.readCount !== fez.members.postCount) {
      // @TODO broke this again
      // markFezRead(fez.fezID);
    }

    // Navigation Options
    if (fez) {
      navigation.setOptions({
        headerRight: getNavButtons,
      });
    }

    // Socket. yes this is duplicated for now.
    if (fez) {
      openFezSocket(fez.fezID);
      if (fezSocket && fezSocket.readyState === WebSocket.OPEN) {
        console.log('[FezSocket] adding fezSocketMessageHandler for SeamailScreen');
        fezSocket.addEventListener('message', fezSocketMessageHandler);
      }
    }

    return () => {
      console.log('%%% SeamailScreen::useEffect::return');
      closeFezSocket();
    };
  }, [
    closeFezSocket,
    data,
    fez,
    fezSocket,
    fezSocketMessageHandler,
    getNavButtons,
    navigation,
    openFezSocket,
    setFez,
    setFezPageData,
    markFezRead,
  ]);

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

  console.log('^^^ Finished Rendering');

  if (!fez || !data) {
    return <LoadingView />;
  }

  // This is a big sketch. See below for more reasons why this is a thing.
  // https://www.reddit.com/r/reactjs/comments/rgyy68/can_somebody_help_me_understand_why_does_reverse/?rdt=33460
  const fezPostData: FezPostData[] = [...data.pages.flatMap(page => page.members?.posts || [])].reverse();
  return (
    <AppView>
      <FezPostAsUserBanner />
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
        data={fezPostData}
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
            <FezPostListItem fezPost={item} index={index} separators={separators} fez={data.pages[0]} />
          </PaddedContentView>
        )}
        // End is Start, Start is End.
        onEndReached={handleLoadPrevious}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} />}
      <FezPostForm onSubmit={onSubmit} />
    </AppView>
  );
};
