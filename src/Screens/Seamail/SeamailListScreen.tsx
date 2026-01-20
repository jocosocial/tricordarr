import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {SeamailFAB} from '#src/Components/Buttons/FloatingActionButtons/SeamailFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SeamailAccountButtons} from '#src/Components/Buttons/SegmentedButtons/SeamailAccountButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {SeamailFlatList} from '#src/Components/Lists/Fez/SeamailFlatList';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {SeamailListScreenActionsMenu} from '#src/Components/Menus/Seamail/SeamailListScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {usePagination} from '#src/Hooks/usePagination';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useSeamailListQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.seamailListScreen>;

export const SeamailListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.seamailHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={'/seamail'}>
          <SeamailListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const SeamailListScreenInner = ({navigation, route}: Props) => {
  const {hasTwitarrTeam, hasModerator, asPrivilegedUser} = usePrivilege();
  // showUnreadOnly should almost never be false since that's not useful. The query will not
  // pass undefined to the API.
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean | undefined>(undefined);
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading} = useSeamailListQuery({
    forUser: asPrivilegedUser,
    onlyNew: showUnreadOnly,
  });
  const {notificationSocket, closeFezSocket} = useSocket();
  const isFocused = useIsFocused();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const [fezList, setFezList] = useState<FezData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const queryClient = useQueryClient();
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  useEffect(() => {
    if (data && data.pages) {
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await refetchUserNotificationData();
    setRefreshing(false);
  }, [refetch, refetchUserNotificationData]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.seamailUnreadMsg) {
        const invalidations = FezData.getCacheKeys().map(key => {
          return queryClient.invalidateQueries({queryKey: key});
        });
        Promise.all(invalidations);
      } else {
        // This is kinda a lazy way out, but it works.
        // Not using onRefresh() so that we don't show the sudden refreshing circle.
        // Hopefully that's a decent idea.
        refetch();
      }
      // }
    },
    [queryClient, refetch],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <MenuAnchor
            active={showUnreadOnly}
            title={'Filter Unread'}
            iconName={AppIcons.seamailUnread}
            onPress={() => setShowUnreadOnly(prev => (prev === true ? undefined : true))}
          />
          <Item
            title={'Search'}
            iconName={AppIcons.search}
            onPress={() =>
              navigation.push(ChatStackScreenComponents.seamailSearchScreen, {
                forUser: asPrivilegedUser,
              })
            }
          />
          <SeamailListScreenActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [showUnreadOnly, asPrivilegedUser, navigation]);

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
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [isFocused, closeFezSocket, navigation, getNavButtons]);

  /**
   * This operates more like an intent than a state.
   * When the user navigates from the NotificationsMenu it's almost certainly
   * because they want to see unread seamails. All other cases should be normal.
   */
  useEffect(() => {
    if (route.params?.onlyNew !== undefined) {
      setShowUnreadOnly(route.params.onlyNew);
    }
  }, [route.params]);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {profilePublicData && (hasTwitarrTeam || hasModerator) && (
        // For some reason, SegmentedButtons hates the flex in PaddedContentView.
        <View style={[commonStyles.paddingSmall]}>
          <SeamailAccountButtons />
        </View>
      )}
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        onScrollThreshold={onScrollThreshold}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
      <SeamailFAB showLabel={showFabLabel} />
    </AppView>
  );
};
