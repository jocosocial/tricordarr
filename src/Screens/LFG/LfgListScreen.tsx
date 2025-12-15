import {useIsFocused} from '@react-navigation/native';
import {type FlashListRef} from '@shopify/flash-list';
import {useQueryClient} from '@tanstack/react-query';
import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {LfgFAB} from '#src/Components/Buttons/FloatingActionButtons/LfgFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {LFGFlatList} from '#src/Components/Lists/Schedule/LFGFlatList';
import {LfgFilterMenu} from '#src/Components/Menus/LFG/LfgFilterMenu';
import {LfgListActionsMenu} from '#src/Components/Menus/LFG/LfgListActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import {LfgStackComponents, useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';
import {FezListEndpoints} from '#src/Types';

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
  const {lfgTypeFilter, lfgHidePastFilter} = useFilter();
  const {isLoggedIn} = useAuth();
  const {commonStyles} = useStyles();
  const [fezList, setFezList] = useState<FezData[]>([]);
  const listRef = useRef<FlashListRef<FezData>>(null);

  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setFezList([]), []),
  });
  const {
    data,
    isFetching,
    refetch,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
  } = useLfgListQuery({
    endpoint: endpoint,
    fezType: lfgTypeFilter,
    // @TODO we intend to change this some day. Upstream Swiftarr issue.
    cruiseDay: selectedCruiseDay - 1,
    hidePast: lfgHidePastFilter,
  });
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {notificationSocket} = useSocket();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const queryClient = useQueryClient();

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <MaterialHeaderButtons>
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
              <LfgFilterMenu />
            </>
          )}
          <LfgListActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableFilters, endpoint, isLoggedIn, navigation]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
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
      onDataLoaded();
    }
  }, [data, onDataLoaded]);

  // Reset switching state on error to prevent stuck loading spinner
  useEffect(() => {
    if (isError) {
      onQueryError();
    }
  }, [isError, onQueryError]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  const isRefreshing = isFetching || isFetchingNextPage || isFetchingPreviousPage;

  const styles = StyleSheet.create({
    loadingContainer: {
      ...commonStyles.flex,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
  });

  return (
    <AppView>
      <TimezoneWarningView />
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={handleSetCruiseDay} />
      <View style={[commonStyles.flex]}>
        {isSwitchingDays ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <LFGFlatList
            listRef={listRef}
            items={fezList}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
            separator={'day'}
            onScrollThreshold={onScrollThreshold}
            handleLoadNext={fetchNextPage}
            hasNextPage={hasNextPage}
            enableReportOnly={enableReportOnly}
            listHeader={listHeader}
          />
        )}
      </View>
      {showFab && <LfgFAB showLabel={showFabLabel} />}
    </AppView>
  );
};
