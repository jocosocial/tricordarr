import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {UserListFAB} from '#src/Components/Buttons/FloatingActionButtons/UserListFAB';
import {UserListSelectionHeaderButtons} from '#src/Components/Buttons/HeaderButtons/UserListSelectionHeaderButtons';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SelectionButtons} from '#src/Components/Buttons/SegmentedButtons/SelectionButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserFlatList} from '#src/Components/Lists/User/UserFlatList';
import {UserListHeader} from '#src/Components/Lists/User/UserListHeader';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {SelectionProvider} from '#src/Context/Providers/SelectionProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {
  USER_RELATION_SCREEN_TITLES,
  USER_RELATION_URL_PATHS,
  type UserRelationMode,
} from '#src/Queries/Users/UserRelationConstants';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.usersList>;

export const UsersListScreen = (props: Props) => {
  const mode = props.route.params?.mode ?? 'favorite';
  const screen = (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={USER_RELATION_URL_PATHS[mode]}>
      <SelectionProvider>
        <UsersListScreenInner {...props} mode={mode} />
      </SelectionProvider>
    </DisabledFeatureScreen>
  );

  if (mode === 'favorite') {
    return <LoggedInScreen>{screen}</LoggedInScreen>;
  }

  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.userProfileHelpScreen}>{screen}</PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const UsersListScreenInner = ({navigation, mode}: Props & {mode: UserRelationMode}) => {
  const {preRegistrationMode} = usePreRegistration();
  const {hasModerator} = usePrivilege();
  const {selectedItems, enableSelection} = useSelection();
  const favoriteQuery = useUserFavoritesQuery({enabled: mode === 'favorite'});
  const muteQuery = useUserMutesQuery({enabled: mode === 'mute'});
  const blockQuery = useUserBlocksQuery({enabled: mode === 'block'});

  const activeQuery = mode === 'favorite' ? favoriteQuery : mode === 'mute' ? muteQuery : blockQuery;
  const {refreshing, onRefresh, setRefreshing} = useRefresh({
    refresh: activeQuery.refetch,
    isRefreshing: activeQuery.isFetching,
  });

  const getNavButtons = useCallback(() => {
    if (enableSelection) {
      return (
        <UserListSelectionHeaderButtons
          mode={mode}
          items={activeQuery.data ?? []}
          selectedItems={selectedItems}
          setRefreshing={setRefreshing}
        />
      );
    }
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.userDirectoryHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableSelection, mode, activeQuery.data, selectedItems, setRefreshing, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      title: enableSelection ? `Selected: ${selectedItems.length}` : USER_RELATION_SCREEN_TITLES[mode],
    });
  }, [getNavButtons, mode, navigation, enableSelection, selectedItems.length]);

  const handleUserPress = useCallback(
    (relatedUserHeader: UserHeader) => {
      if (preRegistrationMode && mode === 'favorite') {
        return;
      }
      navigation.push(CommonStackComponents.userProfileScreen, {
        userID: relatedUserHeader.userID,
      });
    },
    [preRegistrationMode, mode, navigation],
  );

  const renderListHeader = useCallback(() => {
    if (enableSelection) {
      return <SelectionButtons items={activeQuery.data?.map(Selectable.fromUserHeader)} />;
    }
    return <UserListHeader mode={mode} hasModerator={hasModerator} />;
  }, [enableSelection, activeQuery.data, mode, hasModerator]);

  if (activeQuery.data === undefined) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <UserFlatList
        userHeaders={activeQuery.data}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
        onUserPress={handleUserPress}
        swipeableMode={preRegistrationMode ? undefined : mode}
      />
      {!enableSelection && (
        <UserListFAB
          mode={mode}
          onPress={() =>
            navigation.push(CommonStackComponents.searchUsers, {
              mode: mode,
            })
          }
        />
      )}
    </AppView>
  );
};
