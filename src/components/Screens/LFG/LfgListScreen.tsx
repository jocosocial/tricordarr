import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {LfgFilterMenu} from '../../Menus/LFG/LfgFilterMenu.tsx';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {LfgCruiseDayFilterMenu} from '../../Menus/LFG/LfgCruiseDayFilterMenu.tsx';
import {LfgListActionsMenu} from '../../Menus/LFG/LfgListActionsMenu.tsx';
import {LfgFAB} from '../../Buttons/FloatingActionButtons/LfgFAB';
import {useIsFocused} from '@react-navigation/native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NotificationTypeData, SocketNotificationData} from '../../../libraries/Structs/SocketStructs';
import {LFGFlatList} from '../../Lists/Schedule/LFGFlatList.tsx';
import {TimezoneWarningView} from '../../Views/Warnings/TimezoneWarningView.tsx';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlashList} from '@shopify/flash-list';
import {FezListEndpoints} from '../../../libraries/Types';

interface LfgJoinedScreenProps {
  endpoint: FezListEndpoints;
}

export const LfgListScreen = ({endpoint}: LfgJoinedScreenProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCruiseDayFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {data, isFetching, refetch, isLoading, fetchNextPage, isFetchingPreviousPage, isFetchingNextPage, hasNextPage} =
    useLfgListQuery({
      endpoint: endpoint,
      fezType: lfgTypeFilter,
      // @TODO we intend to fix this some day. Upstream Swiftarr issue.
      cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
      hidePast: lfgHidePastFilter,
    });
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {setLfg, lfgList, dispatchLfgList} = useTwitarr();
  const {notificationSocket, closeFezSocket} = useSocket();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const listRef = useRef<FlashList<FezData>>(null);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <LfgCruiseDayFilterMenu />
          <LfgFilterMenu />
          <LfgListActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
        if (lfgList.some(f => f.fezID === socketMessage.contentID)) {
          dispatchLfgList({
            type: FezListActions.incrementPostCount,
            fezID: socketMessage.contentID,
          });
          dispatchLfgList({
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
    [dispatchLfgList, lfgList, refetch],
  );

  useEffect(() => {
    if (notificationSocket && isFocused) {
      notificationSocket.addEventListener('message', notificationHandler);
    } else if (notificationSocket && !isFocused) {
      notificationSocket.removeEventListener('message', notificationHandler);
    }
    return () => {
      if (notificationSocket) {
        notificationSocket.removeEventListener('message', notificationHandler);
      }
    };
  }, [isFocused, notificationHandler, notificationSocket]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (isFocused) {
      closeFezSocket();
      setLfg(undefined);
    }
  }, [closeFezSocket, getNavButtons, isFocused, navigation, setLfg]);

  useEffect(() => {
    if (data && data.pages && isFocused) {
      dispatchLfgList({
        type: FezListActions.set,
        fezList: data.pages.flatMap(p => p.fezzes),
      });
    }
  }, [data, dispatchLfgList, isFocused]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <TimezoneWarningView />
      <LFGFlatList
        listRef={listRef}
        items={lfgList}
        refreshControl={
          <RefreshControl refreshing={isFetching || isFetchingNextPage || isFetchingPreviousPage} onRefresh={refetch} />
        }
        separator={'day'}
        onScrollThreshold={onScrollThreshold}
        handleLoadNext={fetchNextPage}
        hasNextPage={hasNextPage}
      />
      <LfgFAB showLabel={showFabLabel} />
    </AppView>
  );
};
