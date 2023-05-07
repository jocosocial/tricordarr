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
import axios from 'axios';
import {Text} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useFezPostMutation} from '../../Queries/Fez/FezPostQueries';
import {useSocket} from '../../Context/Contexts/NotificationSocketContext';
import {SocketFezPostData} from '../../../libraries/Structs/SocketStructs';
import {FezPostAsUserBanner} from '../../Banners/FezPostAsUserBanner';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {useFezSocket} from '../../Context/Contexts/FezSocketContext';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {fez, setFez, markFezRead, setFezPageData, fezPageData} = useTwitarr();
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {fezSocket, closeFezSocket, openFezSocket} = useFezSocket();

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

  useEffect(() => {
    console.log('%%% SeamailScreen::useEffect::Navigation');
    // Set provider data
    // This is triggering an unmount/mount of the SeamailListScreen.
    // Not sure if it's a problem yet.
    setFezPageData(data);
    setFez(data?.pages[0]);

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
  ]);

  console.log('^^^ Finished Rendering');

  if (!fez) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <FezPostAsUserBanner />
    </AppView>
  );
};
