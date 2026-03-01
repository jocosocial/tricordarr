import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {UserListFAB} from '#src/Components/Buttons/FloatingActionButtons/UserListFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserFlatList} from '#src/Components/Lists/User/UserFlatList';
import {UserListHeader} from '#src/Components/Lists/User/UserListHeader';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {
  USER_RELATION_ACTIONS,
  USER_RELATION_SCREEN_TITLES,
  USER_RELATION_URL_PATHS,
  type UserRelationMode,
} from '#src/Queries/Users/UserRelationConstants';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.usersList>;

const REMOVE_ACTION_LABELS: Record<UserRelationMode, string> = {
  favorite: 'Unfavorite',
  block: 'Unblock',
  mute: 'Unmute',
};

const REMOVE_ACTION_ICONS: Record<UserRelationMode, AppIcons> = {
  favorite: AppIcons.unfavorite,
  block: AppIcons.unblock,
  mute: AppIcons.unmute,
};

export const UsersListScreen = (props: Props) => {
  const mode = props.route.params?.mode ?? 'favorite';
  const screen = (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={USER_RELATION_URL_PATHS[mode]}>
      <UsersListScreenInner {...props} mode={mode} />
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
  const {removeRelation} = useUserCacheReducer();
  const favoriteMutation = useUserFavoriteMutation();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const [pendingRelationUserID, setPendingRelationUserID] = useState<string>();
  const favoriteQuery = useUserFavoritesQuery({enabled: mode === 'favorite'});
  const muteQuery = useUserMutesQuery({enabled: mode === 'mute'});
  const blockQuery = useUserBlocksQuery({enabled: mode === 'block'});

  const activeQuery = mode === 'favorite' ? favoriteQuery : mode === 'mute' ? muteQuery : blockQuery;
  const activeMutation = mode === 'favorite' ? favoriteMutation : mode === 'mute' ? muteMutation : blockMutation;
  const {refreshing, onRefresh} = useRefresh({
    refresh: activeQuery.refetch,
    isRefreshing: activeQuery.isFetching,
  });

  const getNavButtons = useCallback(() => {
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
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      title: USER_RELATION_SCREEN_TITLES[mode],
    });
  }, [getNavButtons, mode, navigation]);

  const handleRemoveRelation = (userHeader: UserHeader) => {
    setPendingRelationUserID(userHeader.userID);
    if (mode === 'favorite') {
      favoriteMutation.mutate(
        {
          action: USER_RELATION_ACTIONS[mode].remove as 'unfavorite',
          userID: userHeader.userID,
        },
        {
          onSuccess: () => {
            removeRelation(mode, userHeader);
          },
          onSettled: () => {
            setPendingRelationUserID(undefined);
          },
        },
      );
      return;
    }

    if (mode === 'mute') {
      muteMutation.mutate(
        {
          action: USER_RELATION_ACTIONS[mode].remove as 'unmute',
          userID: userHeader.userID,
        },
        {
          onSuccess: () => {
            removeRelation(mode, userHeader);
          },
          onSettled: () => {
            setPendingRelationUserID(undefined);
          },
        },
      );
      return;
    }

    blockMutation.mutate(
      {
        action: USER_RELATION_ACTIONS[mode].remove as 'unblock',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          removeRelation(mode, userHeader);
        },
        onSettled: () => {
          setPendingRelationUserID(undefined);
        },
      },
    );
  };

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

  const renderListHeader = useCallback(
    () => <UserListHeader mode={mode} hasModerator={hasModerator} />,
    [mode, hasModerator],
  );

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
        swipeable={
          preRegistrationMode
            ? undefined
            : {
                relationActionLabel: REMOVE_ACTION_LABELS[mode],
                relationActionIcon: REMOVE_ACTION_ICONS[mode],
                onRelationAction: handleRemoveRelation,
                getRelationActionRefreshing: (userID: string) =>
                  activeMutation.isPending && pendingRelationUserID === userID,
              }
        }
      />
      <UserListFAB
        mode={mode}
        onPress={() =>
          navigation.push(CommonStackComponents.searchUsers, {
            mode: mode,
          })
        }
      />
    </AppView>
  );
};
