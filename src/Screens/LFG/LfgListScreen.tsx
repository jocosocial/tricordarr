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
import {LfgPreRegistrationEmptyView} from '#src/Components/Views/Static/LfgPreRegistrationEmptyView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToNow} from '#src/Hooks/useScrollToNow';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  LfgStackComponents,
  LfgStackParamList,
  useLFGStackNavigation,
} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useLfgSourceQuery} from '#src/Queries/Fez/LfgListQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';
import {LfgListEndpoint, ScheduleFlatListSeparator} from '#src/Types';

interface LfgListScreenInnerProps {
  endpoint: LfgListEndpoint;
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
  enableFilters = true,
  enableReportOnly,
  listHeader,
  showFab = true,
  onlyNewInitial,
  cruiseDayInitial,
  scrollToTopIntent,
}: LfgListScreenInnerProps) => {
  const {lfgTypeFilter, lfgHidePastFilter, lfgCancelledFilter, lfgOnlyNew, setLfgOnlyNew, lfgFavoriteFilter} =
    useLfgFilter();
  // Former has no FezParticipant pivot, so ?favorite and ?onlynew are meaningless there. On 'all'
  // they make the list query joined only (useLfgSourceQuery), since open LFGs can never match.
  const supportsMemberFilters = endpoint !== 'former';
  const {commonStyles} = useStyles();
  const {preRegistrationMode} = usePreRegistration();
  const [fezList, setFezList] = useState<FezData[]>([]);
  const listRef = useRef<FlashListRef<FezData>>(null);

  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setFezList([]), []),
    defaultCruiseDay: cruiseDayInitial,
  });
  const {fezzes, refetch, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching} =
    useLfgSourceQuery({
      endpoint: endpoint,
      fezType: lfgTypeFilter,
      // @TODO we intend to change this some day. Upstream Swiftarr issue.
      // Don't pass cruiseDay for 'former' endpoint to show all days
      // selectedCruiseDay === 0 means "All Days" in the UI, pass undefined to API to get all days
      cruiseDay: endpoint === 'former' || selectedCruiseDay === 0 ? undefined : selectedCruiseDay - 1,
      hidePast: lfgHidePastFilter,
      cancelledOnly: endpoint !== 'former' && lfgCancelledFilter,
      onlyNew: supportsMemberFilters ? lfgOnlyNew : undefined,
      favorite: supportsMemberFilters ? lfgFavoriteFilter : undefined,
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
    // The list is filtered to the selected day, so "now" must be placed on that day, not the real one.
    selectedCruiseDay,
  });
  const navigation = useLFGStackNavigation();
  const isFocused = useIsFocused();
  const {notificationSocket} = useSocket();
  const {invalidateFez} = useFezCacheReducer();

  // We used to show the time separators for all days all lists. However since realizing that sorting
  // LFGs is highly variable by endpoint (joined and owned differ from each other) that divider is kinda
  // meaningless. Especially since we already show the time in the card.
  // The merged All list and Former sort by startTime so those are the only ones we potentially want
  // to show the dividers in.
  const showDayInDividers = (selectedCruiseDay === 0 && endpoint === 'all') || endpoint === 'former';
  const listSeparator: ScheduleFlatListSeparator = showDayInDividers ? 'day' : 'none';

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          {enableFilters && (
            <>
              {/* Search isn't available to pre-registration users. */}
              {!preRegistrationMode && (
                <Item
                  title={'Search'}
                  iconName={AppIcons.search}
                  onPress={() =>
                    navigation.push(LfgStackComponents.lfgSearchScreen, {
                      endpoint: endpoint,
                    })
                  }
                />
              )}
              <LfgFilterMenu />
            </>
          )}
          <LfgListActionsMenu endpoint={endpoint} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableFilters, endpoint, navigation, preRegistrationMode]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
        void invalidateFez();
      } else {
        void refetch();
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
    if (!isLoading) {
      setFezList(fezzes);
      onDataLoaded();
    }
  }, [fezzes, isLoading, onDataLoaded]);

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

  /**
   * showDayInCard used to be false for all lists. But with the added complexity of dividers
   * (see above) I think the consistency is more better with true.
   */
  return (
    <AppView>
      <TimezoneWarningView />
      {endpoint !== 'former' && (
        <ScheduleHeaderView
          selectedCruiseDay={selectedCruiseDay}
          setCruiseDay={handleSetCruiseDay}
          scrollToNow={endpoint === 'all' ? scrollToNow : undefined}
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
            showDayInDividers={showDayInDividers}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            separator={listSeparator}
            handleLoadNext={handleLoadNext}
            hasNextPage={hasNextPage}
            enableReportOnly={enableReportOnly}
            showDayInCard={true}
            listHeader={preRegistrationMode && fezList.length === 0 ? <LfgPreRegistrationEmptyView /> : listHeader}
            overScroll={true}
          />
        )}
      </View>
      {showFab && <LfgFAB cruiseDay={selectedCruiseDay} />}
    </AppView>
  );
};

interface LfgListScreenWithEndpointProps extends StackScreenProps<
  LfgStackParamList,
  LfgStackComponents.lfgListScreen
> {}

/**
 * Middle component that handles route parameters and state management.
 *
 * The All/Joined/Owned source now lives in `LfgFilterContext` (it's a filter, selected from the
 * LfgFilterMenu), not local state. The route param is kept in sync in both directions so deep
 * links (`lfg/:endpoint?`), the navigator's title, and `useScrollToTopIntent`'s
 * `{key: 'endpoint', value: 'joined'}` route-param matching all keep working unchanged. 'former'
 * is a separate pushed screen and never writes into the context.
 */
const LfgListScreenWithEndpoint = ({route, navigation}: LfgListScreenWithEndpointProps) => {
  const {lfgSourceFilter, setLfgSourceFilter} = useLfgFilter();
  const isFormer = route.params.endpoint === 'former';
  // In pre-registration mode LfgFilterProvider holds the source on Owned, so this (and the
  // route param and title it syncs to) follows the source like any other selection.
  const endpoint: LfgListEndpoint = isFormer ? 'former' : lfgSourceFilter;

  // Tracks the last value written by either direction, so the two effects below don't fight.
  const lastSyncedRef = useRef<LfgListEndpoint | undefined>(undefined);

  // Adopt an externally-set route param (initial mount, deep link) into the context.
  useEffect(() => {
    // A link to /lfg replaces the params without one, and initialParams only applies on first mount.
    const param = route.params.endpoint ?? 'all';
    if (param !== 'former' && param !== lastSyncedRef.current) {
      lastSyncedRef.current = param;
      setLfgSourceFilter(param);
    }
  }, [route.params.endpoint, setLfgSourceFilter]);

  // Mirror context changes (from the filter menu) back onto the route param.
  useEffect(() => {
    if (!isFormer && lastSyncedRef.current !== lfgSourceFilter) {
      lastSyncedRef.current = lfgSourceFilter;
      navigation.setParams({endpoint: lfgSourceFilter});
    }
  }, [lfgSourceFilter, isFormer, navigation]);

  // Determine endpoint-specific props
  const enableFilters = endpoint !== 'former';
  const enableReportOnly = endpoint === 'former';
  const showFab = endpoint !== 'former';

  // Determine urlPath based on endpoint
  const urlPathMap: Record<LfgListEndpoint, string> = {
    all: '/lfg',
    joined: '/lfg/joined',
    owner: '/lfg/owned',
    former: '/lfg/former',
  };

  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={urlPathMap[endpoint]}>
      <LfgListScreenInner
        key={route.params.intent}
        endpoint={endpoint}
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
      <PreRegistrationScreen
        helpScreen={CommonStackComponents.lfgHelpScreen}
        allowed={props.route.params.endpoint !== 'former'}>
        <LfgListScreenWithEndpoint {...props} />
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
