import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {LfgFAB} from '#src/Components/Buttons/FloatingActionButtons/LfgFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {LFGFlatList} from '#src/Components/Lists/Schedule/LFGFlatList';
import {LfgFilterMenu} from '#src/Components/Menus/LFG/LfgFilterMenu';
import {LfgListActionsMenu} from '#src/Components/Menus/LFG/LfgListActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToNow} from '#src/Hooks/useScrollToNow';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {LfgStackComponents, LfgStackParamList, useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';
import {FezListEndpoints, ScheduleFlatListSeparator} from '#src/Types';

interface LfgListScreenInnerProps {
  endpoint: FezListEndpoints;
  setEndpoint: (endpoint: FezListEndpoints) => void;
  enableFilters?: boolean;
  enableReportOnly?: boolean;
  listHeader?: ReactElement;
  showFab?: boolean;
  onlyNewInitial?: boolean;
  cruiseDayInitial?: number;
  scrollToTopIntent?: number;
}

/**
 * Inner component containing the actual LFG list logic.
 * This assumes LoggedIn, PreRegistration, and Disabled checkpoints have been handled.
 */
const LfgListScreenInner = ({
  endpoint,
  setEndpoint,
  enableFilters = true,
  enableReportOnly,
  listHeader,
  showFab = true,
  onlyNewInitial,
  cruiseDayInitial,
  scrollToTopIntent,
}: LfgListScreenInnerProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgOnlyNew, setLfgOnlyNew} = useLfgFilter();
  const {commonStyles} = useStyles();
  const [fezList, setFezList] = useState<FezData[]>([]);
  const listRef = useRef<FlashListRef<FezData>>(null);
  // const processedIntentRef = useRef<string | null>(null);

  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setFezList([]), []),
    defaultCruiseDay: cruiseDayInitial,
  });
  const {data, refetch, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching} =
    useLfgListQuery({
      endpoint: endpoint,
      fezType: lfgTypeFilter,
      // @TODO we intend to change this some day. Upstream Swiftarr issue.
      // Don't pass cruiseDay for 'former' endpoint to show all days
      // selectedCruiseDay === 0 means "All Days" in the UI, pass undefined to API to get all days
      cruiseDay: endpoint === 'former' || selectedCruiseDay === 0 ? undefined : selectedCruiseDay - 1,
      hidePast: lfgHidePastFilter,
      onlyNew: lfgOnlyNew,
    });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const {scrollToNow} = useScrollToNow({
    items: fezList,
    listRef,
  });
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {notificationSocket} = useSocket();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const {invalidateFez} = useFezCacheReducer();
  const listSeparator: ScheduleFlatListSeparator = endpoint === 'joined' || endpoint === 'owner' ? 'none' : 'time';

  const getNavButtons = useCallback(() => {
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
              <LfgFilterMenu enableUnread={endpoint === 'joined'} />
            </>
          )}
          <LfgListActionsMenu endpoint={endpoint} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableFilters, endpoint, navigation]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
        invalidateFez();
      } else {
        refetch();
      }
    },
    [invalidateFez, refetch],
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

  /**
   * This operates more like an intent than a state.
   * When the user navigates from the NotificationsMenu it's almost certainly
   * because they want to see unread LFGs. All other cases should be normal.
   */
  useEffect(() => {
    if (onlyNewInitial !== undefined) {
      setLfgOnlyNew(onlyNewInitial);
    }
  }, [onlyNewInitial, setLfgOnlyNew]);

  // Reset switching state on error to prevent stuck loading spinner
  useEffect(() => {
    if (isError) {
      onQueryError();
    }
  }, [isError, onQueryError]);

  useEffect(() => {
    if (scrollToTopIntent) {
      listRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

  /**
   * Scroll to top when the endpoint changes.
   */
  useEffect(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }, [endpoint]);

  return (
    <AppView>
      <TimezoneWarningView />
      {endpoint !== 'former' && (
        <ScheduleHeaderView
          selectedCruiseDay={selectedCruiseDay}
          setCruiseDay={handleSetCruiseDay}
          scrollToNow={endpoint === 'open' ? scrollToNow : undefined}
          enableAll={true}
        />
      )}
      <View style={[commonStyles.flex]}>
        {isLoading || isSwitchingDays ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <LFGFlatList
            listRef={listRef}
            items={fezList}
            showDayInDividers={selectedCruiseDay === 0 || endpoint === 'former'}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            separator={listSeparator}
            onScrollThreshold={onScrollThreshold}
            handleLoadNext={handleLoadNext}
            hasNextPage={hasNextPage}
            enableReportOnly={enableReportOnly}
            showDayInCard={false}
            listHeader={listHeader}
            overScroll={true}
          />
        )}
      </View>
      {showFab && (
        <LfgFAB showLabel={showFabLabel} endpoint={endpoint} setEndpoint={setEndpoint} cruiseDay={selectedCruiseDay} />
      )}
    </AppView>
  );
};

interface LfgListScreenWithEndpointProps
  extends StackScreenProps<LfgStackParamList, LfgStackComponents.lfgListScreen> {}

/**
 * Middle component that handles route parameters and state management.
 */
const LfgListScreenWithEndpoint = ({route, navigation}: LfgListScreenWithEndpointProps) => {
  const [endpoint, setEndpoint] = useState<FezListEndpoints>(route.params.endpoint);

  // Sync state with route params (for external navigation)
  useEffect(() => {
    if (route.params.endpoint !== endpoint) {
      setEndpoint(route.params.endpoint);
    }
  }, [route.params.endpoint, endpoint]);

  // Determine endpoint-specific props
  const enableFilters = endpoint !== 'former';
  const enableReportOnly = endpoint === 'former';
  const showFab = endpoint !== 'former';

  // Determine urlPath based on endpoint
  const urlPathMap: Record<FezListEndpoints, string> = {
    open: '/lfg',
    joined: '/lfg/joined',
    owner: '/lfg/owned',
    former: '/lfg/former',
  };

  const wrappedSetEndpoint = useCallback(
    (newEndpoint: FezListEndpoints) => {
      setEndpoint(newEndpoint);
      navigation.setParams({endpoint: newEndpoint});
    },
    [navigation],
  );

  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={urlPathMap[endpoint]}>
      <LfgListScreenInner
        key={route.params.intent}
        endpoint={endpoint}
        setEndpoint={wrappedSetEndpoint}
        enableFilters={enableFilters}
        enableReportOnly={enableReportOnly}
        showFab={showFab}
        onlyNewInitial={route.params.onlyNew}
        cruiseDayInitial={route.params.cruiseDay}
        scrollToTopIntent={route.params.scrollToTopIntent}
      />
    </DisabledFeatureScreen>
  );
};

export type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgListScreen>;

/**
 * Main LFG list screen that handles route props and checkpoints.
 * This screen consolidates LfgFindScreen, LfgJoinedScreen, LfgOwnedScreen, and LfgFormerScreen.
 */
export const LfgListScreen = (props: Props) => {
  const {getLeftMainHeaderButtons, getLeftBackHeaderButtons} = useDrawer();

  useEffect(() => {
    const shouldShowBackButton = props.route.params.endpoint === 'former' && props.navigation.canGoBack();
    props.navigation.setOptions({
      headerLeft: shouldShowBackButton ? getLeftBackHeaderButtons : getLeftMainHeaderButtons,
    });
  }, [getLeftMainHeaderButtons, getLeftBackHeaderButtons, props.navigation, props.route.params.endpoint]);

  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
        <LfgListScreenWithEndpoint {...props} />
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
