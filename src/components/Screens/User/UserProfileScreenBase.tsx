import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {
  BottomTabComponents,
  MainStackComponents,
  RootStackComponents,
  SeamailStackScreenComponents,
  SettingsStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ProfilePublicData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserProfileActionsMenu} from '../../Menus/UserProfileActionsMenu';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {BlockedOrMutedBanner} from '../../Banners/BlockedOrMutedBanner';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {UserContentCard} from '../../Cards/UserProfile/UserContentCard';
import {UserAboutCard} from '../../Cards/UserProfile/UserAboutCard';
import {UserProfileCard} from '../../Cards/UserProfile/UserProfileCard';
import {UserNoteCard} from '../../Cards/UserProfile/UserNoteCard';
import {AppIcon} from '../../Icons/AppIcon';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {useMainStack} from '../../Navigation/Stacks/MainStack';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import Clipboard from '@react-native-clipboard/clipboard';
import {UserProfileAvatar} from '../../Views/UserProfileAvatar';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {ErrorView} from '../../Views/Static/ErrorView';
import {useAppTheme} from '../../../styles/Theme';

interface UserProfileScreenBaseProps {
  data?: ProfilePublicData;
  refetch: () => Promise<any>;
  isLoading: boolean;
}
export const UserProfileScreenBase = ({data, refetch, isLoading}: UserProfileScreenBaseProps) => {
  const navigation = useMainStack();
  const [refreshing, setRefreshing] = useState(false);
  const {profilePublicData} = useUserData();
  const {commonStyles} = useStyles();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const {mutes, refetchMutes, blocks, refetchBlocks, favorites, refetchFavorites} = useUserRelations();
  const rootNavigation = useRootStack();
  const {isLoggedIn} = useAuth();
  const theme = useAppTheme();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => refetchFavorites())
      .then(() => refetchMutes())
      .then(() => refetchBlocks())
      .finally(() => setRefreshing(false));
  }, [refetch, refetchFavorites, refetchMutes, refetchBlocks]);

  const seamailCreateHandler = useCallback(() => {
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.seamailTab,
      params: {
        screen: SeamailStackScreenComponents.seamailCreateScreen,
        params: {
          initialUserHeader: data?.header,
        },
      },
    });
  }, [data?.header, rootNavigation]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    if (data && data?.header.userID === profilePublicData?.header.userID) {
      // I don't love the go back from account settings behavior.
      return (
        <View>
          <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
            <Item
              title={'Edit'}
              iconName={AppIcons.edituser}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.homeTab,
                  params: {
                    screen: MainStackComponents.editUserProfileScreen,
                    params: {
                      user: data,
                    },
                  },
                })
              }
            />
            <Item
              title={'Settings'}
              iconName={AppIcons.settings}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.homeTab,
                  params: {
                    screen: MainStackComponents.mainSettingsScreen,
                    params: {
                      screen: SettingsStackScreenComponents.accountManagement,
                    },
                    initial: false,
                  },
                })
              }
            />
          </HeaderButtons>
        </View>
      );
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {data && <Item title={'Create Seamail'} iconName={AppIcons.seamailCreate} onPress={seamailCreateHandler} />}
          {data && (
            <UserProfileActionsMenu profile={data} isFavorite={isFavorite} isMuted={isMuted} isBlocked={isBlocked} />
          )}
        </HeaderButtons>
      </View>
    );
  }, [
    rootNavigation,
    data,
    isBlocked,
    isFavorite,
    isLoggedIn,
    isMuted,
    profilePublicData?.header.userID,
    seamailCreateHandler,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    // Reset the mute/block state before re-determining.
    setIsFavorite(false);
    setIsMuted(false);
    setIsBlocked(false);
    if (data) {
      // Determine if the user should be blocked, muted, etc.
      favorites.map(favoriteUserHeader => {
        if (favoriteUserHeader.userID === data.header.userID) {
          setIsFavorite(true);
        }
      });
      mutes.map(mutedUserHeader => {
        if (mutedUserHeader.userID === data.header.userID) {
          setIsMuted(true);
        }
      });
      blocks.map(blockedUserHeader => {
        if (blockedUserHeader.userID === data.header.userID) {
          setIsBlocked(true);
        }
      });
    }
  }, [blocks, favorites, getNavButtons, mutes, navigation, data]);

  const styles = {
    listContentCenter: [commonStyles.flexRow, commonStyles.justifyCenter],
    button: [commonStyles.marginHorizontalSmall],
  };

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  if (!data) {
    return <ErrorView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <BlockedOrMutedBanner muted={isMuted} blocked={isBlocked} />
        {data.message && (
          <PaddedContentView padTop={true} padBottom={false} style={[styles.listContentCenter]}>
            <Text selectable={true}>{data.message}</Text>
          </PaddedContentView>
        )}
        <PaddedContentView padTop={true} style={[styles.listContentCenter]}>
          <UserProfileAvatar user={data} setRefreshing={setRefreshing} />
        </PaddedContentView>
        <PaddedContentView style={[styles.listContentCenter]}>
          <Text selectable={true} variant={'headlineMedium'}>
            {isFavorite && (
              <>
                <AppIcon color={theme.colors.twitarrYellow} icon={'star'} />
                &nbsp;
              </>
            )}
            {UserHeader.getByline(data.header)}
          </Text>
        </PaddedContentView>
        {data.note && (
          <PaddedContentView>
            <UserNoteCard
              user={data}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.homeTab,
                  params: {
                    screen: MainStackComponents.userPrivateNoteScreen,
                    params: {
                      user: data,
                    },
                  },
                })
              }
              onLongPress={() => {
                if (data.note !== undefined) {
                  Clipboard.setString(data.note);
                }
              }}
            />
          </PaddedContentView>
        )}
        <PaddedContentView>
          <UserProfileCard user={data} />
        </PaddedContentView>
        {data.about && (
          <PaddedContentView>
            <UserAboutCard user={data} />
          </PaddedContentView>
        )}
        <PaddedContentView>
          <UserContentCard user={data} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
