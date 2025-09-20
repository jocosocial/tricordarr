import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {AppView} from '#src/Views/AppView.tsx';
import {NotLoggedInView} from '#src/Views/Static/NotLoggedInView.tsx';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {SeamailFAB} from '#src/Buttons/FloatingActionButtons/SeamailFAB.tsx';
import {useSeamailListQuery} from '#src/Queries/Fez/FezQueries.ts';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext.ts';
import {useSocket} from '#src/Context/Contexts/SocketContext.ts';
import {NotificationTypeData, SocketNotificationData} from '../../../Libraries/Structs/SocketStructs.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator.tsx';
import {useIsFocused} from '@react-navigation/native';
import {SeamailFlatList} from '#src/Lists/Seamail/SeamailFlatList.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {SeamailAccountButtons} from '#src/Buttons/SegmentedButtons/SeamailAccountButtons.tsx';
import {SeamailListScreenActionsMenu} from '#src/Menus/Seamail/SeamailListScreenActionsMenu.tsx';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries.ts';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useQueryClient} from '@tanstack/react-query';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries.ts';

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
          return queryClient.invalidateQueries(key);
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
