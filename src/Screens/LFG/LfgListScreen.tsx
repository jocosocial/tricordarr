import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries.ts';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {LfgFilterMenu} from '#src/Menus/LFG/LfgFilterMenu.tsx';
import {useFilter} from '#src/Context/Contexts/FilterContext.ts';
import {LfgCruiseDayFilterMenu} from '#src/Menus/LFG/LfgCruiseDayFilterMenu.tsx';
import {LfgListActionsMenu} from '#src/Menus/LFG/LfgListActionsMenu.tsx';
import {LfgFAB} from '#src/Buttons/FloatingActionButtons/LfgFAB.tsx';
import {useIsFocused} from '@react-navigation/native';
import {useSocket} from '#src/Context/Contexts/SocketContext.ts';
import {LfgStackComponents, useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator.tsx';
import {NotLoggedInView} from '#src/Views/Static/NotLoggedInView.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {NotificationTypeData, SocketNotificationData} from '../../../Libraries/Structs/SocketStructs.ts';
import {LFGFlatList} from '#src/Lists/Schedule/LFGFlatList.tsx';
import {TimezoneWarningView} from '#src/Views/Warnings/TimezoneWarningView.tsx';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {FlashList} from '@shopify/flash-list';
import {FezListEndpoints} from '../../../Libraries/Types/index.ts';
import {useQueryClient} from '@tanstack/react-query';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';

interface LfgJoinedScreenProps {
  endpoint: FezListEndpoints;
  enableFilters?: boolean;
  enableReportOnly?: boolean;
  listHeader?: ReactElement;
  showFab?: boolean;
}

export const LfgListScreen = ({
  endpoint,
  enableFilters = true,
  enableReportOnly,
  listHeader,
  showFab = true,
}: LfgJoinedScreenProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCruiseDayFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {data, isFetching, refetch, isLoading, fetchNextPage, isFetchingPreviousPage, isFetchingNextPage, hasNextPage} =
    useLfgListQuery({
      endpoint: endpoint,
      fezType: lfgTypeFilter,
      // @TODO we intend to change this some day. Upstream Swiftarr issue.
      cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
      hidePast: lfgHidePastFilter,
    });
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {notificationSocket} = useSocket();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const listRef = useRef<FlashList<FezData>>(null);
  const queryClient = useQueryClient();
  const [fezList, setFezList] = useState<FezData[]>([]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {enableFilters && (
            <>
              <Item
                title={'Search'}
                iconName={AppIcons.search}
                onPress={() =>
                  navigation.push(LfgStackComponents.lfgSearchScreen, {
                    endpoint: endpoint,
                  })
                }
              />
              <LfgCruiseDayFilterMenu />
              <LfgFilterMenu />
            </>
          )}
          <LfgListActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [enableFilters, endpoint, isLoggedIn, navigation]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
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
    },
    [queryClient, refetch],
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
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

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
        items={fezList}
        refreshControl={
          <RefreshControl refreshing={isFetching || isFetchingNextPage || isFetchingPreviousPage} onRefresh={refetch} />
        }
        separator={'day'}
        onScrollThreshold={onScrollThreshold}
        handleLoadNext={fetchNextPage}
        hasNextPage={hasNextPage}
        enableReportOnly={enableReportOnly}
        listHeader={listHeader}
      />
      {showFab && <LfgFAB showLabel={showFabLabel} />}
    </AppView>
  );
};
