import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {UserFindSearchBar} from '#src/Components/Search/UserSearchBar/UserFindSearchBar';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {UserBlockText, UserFavoriteText, UserMuteText} from '#src/Components/Text/UserRelationsText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {
  USER_RELATION_ACTIONS,
  USER_RELATION_SEARCH_SCREEN_TITLES,
  USER_RELATION_URL_PATHS,
} from '#src/Queries/Users/UserRelationConstants';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.searchUsers>;

export const SearchUsersScreen = (props: Props) => {
  const {mode} = props.route.params;
  const screen = (
    <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={USER_RELATION_URL_PATHS[mode]}>
      <SearchUsersScreenInner {...props} />
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

const SearchUsersScreenInner = ({navigation, route}: Props) => {
  const {preRegistrationMode} = usePreRegistration();
  const {setSnackbarPayload} = useSnackbar();
  const mode = route.params.mode;
  const {addRelation} = useUserCacheReducer();
  const favoriteMutation = useUserFavoriteMutation();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const favoriteQuery = useUserFavoritesQuery({enabled: mode === 'favorite'});
  const muteQuery = useUserMutesQuery({enabled: mode === 'mute'});
  const blockQuery = useUserBlocksQuery({enabled: mode === 'block'});

  const activeQuery = mode === 'favorite' ? favoriteQuery : mode === 'mute' ? muteQuery : blockQuery;

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
      title: USER_RELATION_SEARCH_SCREEN_TITLES[mode],
    });
  }, [getNavButtons, mode, navigation]);

  const handleAddRelation = (userHeader: UserHeader) => {
    const displayName = userHeader.displayName || userHeader.username;
    const successMessages: Record<typeof mode, string> = {
      favorite: `Added ${displayName} to favorites`,
      mute: `Muted ${displayName}`,
      block: `Blocked ${displayName}`,
    };

    if (mode === 'favorite') {
      favoriteMutation.mutate(
        {
          action: USER_RELATION_ACTIONS[mode].add as 'favorite',
          userID: userHeader.userID,
        },
        {
          onSuccess: () => {
            addRelation(mode, userHeader);
            setSnackbarPayload({message: successMessages.favorite, messageType: 'success'});
          },
        },
      );
      return;
    }

    if (mode === 'mute') {
      muteMutation.mutate(
        {
          action: USER_RELATION_ACTIONS[mode].add as 'mute',
          userID: userHeader.userID,
        },
        {
          onSuccess: () => {
            addRelation(mode, userHeader);
            setSnackbarPayload({message: successMessages.mute, messageType: 'success'});
          },
        },
      );
      return;
    }

    blockMutation.mutate(
      {
        action: USER_RELATION_ACTIONS[mode].add as 'block',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          addRelation(mode, userHeader);
          setSnackbarPayload({message: successMessages.block, messageType: 'success'});
        },
      },
    );
  };

  if (activeQuery.data === undefined) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          {mode === 'favorite' && <UserFavoriteText />}
          {mode === 'mute' && <UserMuteText />}
          {mode === 'block' && <UserBlockText />}
        </PaddedContentView>
        <PaddedContentView>
          {mode === 'favorite' && preRegistrationMode ? (
            <UserFindSearchBar excludeHeaders={activeQuery.data} onPress={handleAddRelation} clearOnPress={true} />
          ) : (
            <UserMatchSearchBar excludeHeaders={activeQuery.data} onPress={handleAddRelation} clearOnPress={true} />
          )}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
