import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {SeamailFAB} from '#src/Components/Buttons/FloatingActionButtons/SeamailFAB';
import {SeamailSelectionHeaderButtons} from '#src/Components/Buttons/HeaderButtons/SeamailSelectionHeaderButtons';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SeamailAccountButtons} from '#src/Components/Buttons/SegmentedButtons/SeamailAccountButtons';
import {SelectionButtons} from '#src/Components/Buttons/SegmentedButtons/SelectionButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {SeamailFlatList} from '#src/Components/Lists/Fez/SeamailFlatList';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {SeamailListScreenActionsMenu} from '#src/Components/Menus/Seamail/SeamailListScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SelectionProvider} from '#src/Context/Providers/SelectionProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useSeamailListQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.seamailListScreen>;

export const SeamailListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.seamailHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={'/seamail'}>
          <SelectionProvider>
            <SeamailListScreenInner {...props} />
          </SelectionProvider>
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
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading, isFetching} = useSeamailListQuery({
    forUser: asPrivilegedUser,
    onlyNew: showUnreadOnly,
  });
  const {closeFezSocket} = useSocket();
  const isFocused = useIsFocused();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {commonStyles} = useStyles();
  const {currentUserID} = useSession();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const [fezList, setFezList] = useState<FezData[]>([]);
  const [userSwitchScrollToTopIntent, setUserSwitchScrollToTopIntent] = useState<number | undefined>(undefined);
  const prevAsPrivilegedUserRef = useRef(asPrivilegedUser);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);
  const {selectedItems, enableSelection} = useSelection();
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: useCallback(async () => {
      await Promise.all([refetch(), refetchUserNotificationData()]);
    }, [refetch, refetchUserNotificationData]),
    isRefreshing: isFetching,
  });

  useEffect(() => {
    if (data && data.pages) {
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

  useEffect(() => {
    if (prevAsPrivilegedUserRef.current !== asPrivilegedUser) {
      prevAsPrivilegedUserRef.current = asPrivilegedUser;
      setUserSwitchScrollToTopIntent(Date.now());
    }
  }, [asPrivilegedUser]);

  const getNavButtons = useCallback(() => {
    if (enableSelection) {
      return (
        <View>
          <SeamailSelectionHeaderButtons setRefreshing={setRefreshing} items={fezList} selectedItems={selectedItems} />
        </View>
      );
    }
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
  }, [enableSelection, showUnreadOnly, asPrivilegedUser, navigation, setRefreshing, fezList, selectedItems]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (enableSelection) {
      navigation.setOptions({title: `Selected: ${selectedItems.length}`});
    } else {
      navigation.setOptions({title: 'Seamail'});
    }
  }, [isFocused, closeFezSocket, navigation, getNavButtons, enableSelection, selectedItems.length]);

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
      {enableSelection ? (
        <SelectionButtons items={fezList.map(Selectable.fromFezData)} />
      ) : (
        currentUserID != null &&
        (hasTwitarrTeam || hasModerator) && (
          // For some reason, SegmentedButtons hates the flex in PaddedContentView.
          <View style={[commonStyles.paddingSmall]}>
            <SeamailAccountButtons />
          </View>
        )
      )}
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        onScrollThreshold={onScrollThreshold}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
        scrollToTopIntent={route.params?.scrollToTopIntent ?? userSwitchScrollToTopIntent}
      />
      <SeamailFAB showLabel={showFabLabel} />
    </AppView>
  );
};
