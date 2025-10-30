import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {SeamailFAB} from '#src/Components/Buttons/FloatingActionButtons/SeamailFAB';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {SeamailAccountButtons} from '#src/Components/Buttons/SegmentedButtons/SeamailAccountButtons';
import {SeamailFlatList} from '#src/Components/Lists/Fez/SeamailFlatList';
import {SeamailListScreenActionsMenu} from '#src/Components/Menus/Seamail/SeamailListScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useSeamailListQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

type SeamailListScreenProps = NativeStackScreenProps<ChatStackParamList, ChatStackScreenComponents.seamailListScreen>;

export const SeamailListScreen = ({navigation}: SeamailListScreenProps) => {
  const {hasTwitarrTeam, hasModerator, asPrivilegedUser} = usePrivilege();
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isRefetching, isLoading} = useSeamailListQuery({
    forUser: asPrivilegedUser,
  });
  const {notificationSocket, closeFezSocket} = useSocket();
  const isFocused = useIsFocused();
  const {isLoggedIn} = useAuth();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const [fezList, setFezList] = useState<FezData[]>([]);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const queryClient = useQueryClient();

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (data && data.pages) {
      console.log(data.pages);
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

  const onRefresh = useCallback(() => {
    refetch().finally(() => {
      refetchUserNotificationData();
    });
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
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Search'}
            iconName={AppIcons.seamailSearch}
            onPress={() =>
              navigation.push(ChatStackScreenComponents.seamailSearchScreen, {
                forUser: asPrivilegedUser,
              })
            }
          />
          <SeamailListScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [asPrivilegedUser, navigation]);

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

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {profilePublicData && (hasTwitarrTeam || hasModerator) && (
        // For some reason, SegmentedButtons hates the flex in PaddedContentView.
        <View style={[commonStyles.margin]}>
          <SeamailAccountButtons />
        </View>
      )}
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        onScrollThreshold={onScrollThreshold}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
      <SeamailFAB showLabel={showFabLabel} />
    </AppView>
  );
};
