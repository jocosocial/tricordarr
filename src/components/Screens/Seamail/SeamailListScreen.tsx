import React, {useCallback, useEffect} from 'react';
import {RefreshControl, View} from 'react-native';
import {AppView} from '../../Views/AppView';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {SeamailFAB} from '../../Buttons/FloatingActionButtons/SeamailFAB';
import {useSeamailListQuery} from '../../Queries/Fez/FezQueries';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {NotificationTypeData, SocketNotificationData} from '../../../libraries/Structs/SocketStructs';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useIsFocused} from '@react-navigation/native';
import {SeamailFlatList} from '../../Lists/Seamail/SeamailFlatList';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';

type SeamailListScreenProps = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailListScreen,
  NavigatorIDs.seamailStack
>;

export const SeamailListScreen = ({navigation}: SeamailListScreenProps) => {
  const {hasTwitarrTeam, hasModerator, asPrivilegedUser} = usePrivilege();
  const {fezList, dispatchFezList, setFez} = useTwitarr();
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching, isFetched, isLoading} =
    useSeamailListQuery({
      forUser: asPrivilegedUser,
    });
  const {notificationSocket, closeFezSocket} = useSocket();
  const isFocused = useIsFocused();
  const {isLoggedIn} = useAuth();
  const {refetchUserNotificationData} = useUserNotificationData();
  const {commonStyles} = useStyles();

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (data && data.pages) {
      dispatchFezList({
        type: FezListActions.set,
        fezList: data.pages.flatMap(p => p.fezzes),
      });
    } else {
      dispatchFezList({
        type: FezListActions.set,
        fezList: [],
      });
    }
  }, [data, dispatchFezList]);

  const onRefresh = useCallback(() => {
    refetch().finally(() => {
      refetchUserNotificationData();
    });
  }, [refetch, refetchUserNotificationData]);

  useEffect(() => {
    if (isLoggedIn) {
      onRefresh();
    }
  }, [asPrivilegedUser, onRefresh, isLoggedIn]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.seamailUnreadMsg) {
        if (fezList.some(f => f.fezID === socketMessage.contentID)) {
          dispatchFezList({
            type: FezListActions.incrementPostCount,
            fezID: socketMessage.contentID,
          });
          dispatchFezList({
            type: FezListActions.moveToTop,
            fezID: socketMessage.contentID,
          });
        } else {
          // This is kinda a lazy way out, but it works.
          // Not using onRefresh() so that we don't show the sudden refreshing circle.
          // Hopefully that's a decent idea.
          refetch();
        }
      }
    },
    [dispatchFezList, fezList, refetch],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(SeamailStackScreenComponents.seamailHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    if (notificationSocket) {
      notificationSocket.addEventListener('message', notificationHandler);
    }
    return () => {
      if (notificationSocket) {
        notificationSocket.removeEventListener('message', notificationHandler);
      }
    };
  }, [notificationHandler, notificationSocket]);

  useEffect(() => {
    if (isFocused) {
      closeFezSocket();
      setFez(undefined);
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [isFocused, closeFezSocket, setFez, navigation, getNavButtons]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {(hasTwitarrTeam || hasModerator) && (
        // For some reason, SegmentedButtons hates the flex in PaddedContentView.
        <View style={[commonStyles.margin]}>
          <SeamailAccountButtons />
        </View>
      )}
      {isFetched && fezList.length === 0 && (
        <View key={'noResults'} style={[commonStyles.paddingSmall]}>
          <Text>No Results</Text>
        </View>
      )}
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
      />
      <SeamailFAB />
    </AppView>
  );
};
