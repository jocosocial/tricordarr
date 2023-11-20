import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BottomTabComponents,
  MainStackComponents,
  NavigatorIDs,
  SeamailStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
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
import {AppIcon} from '../../Images/AppIcon';
import {useUserProfileQuery} from '../../Queries/Users/UserProfileQueries';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import Clipboard from '@react-native-clipboard/clipboard';
import {UserProfileAvatar} from '../../Views/UserProfileAvatar';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.userProfileScreen,
  NavigatorIDs.mainStack
>;

export const UserProfileScreen = ({route}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {profilePublicData} = useUserData();
  const {commonStyles} = useStyles();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const {mutes, refetchMutes, blocks, refetchBlocks, favorites, refetchFavorites} = useUserRelations();
  const bottomNavigation = useBottomTabNavigator();
  const {isLoggedIn} = useAuth();

  const {data, refetch} = useUserProfileQuery(route.params.userID);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => refetchFavorites())
      .then(() => refetchMutes())
      .then(() => refetchBlocks())
      .finally(() => setRefreshing(false));
  }, [refetch, refetchFavorites, refetchMutes, refetchBlocks]);

  const seamailCreateHandler = useCallback(() => {
    bottomNavigation.navigate(BottomTabComponents.seamailTab, {
      screen: SeamailStackScreenComponents.seamailCreateScreen,
      params: {
        initialUserHeader: data?.header,
      },
    });
  }, [data?.header, bottomNavigation]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    if (data && data?.header.userID === profilePublicData?.header.userID) {
      // Maybe have an edit button?
      return (
        <View>
          <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
            <Item
              title={'Edit'}
              iconName={AppIcons.edituser}
              onPress={() =>
                bottomNavigation.navigate(BottomTabComponents.homeTab, {
                  screen: MainStackComponents.editUserProfileScreen,
                  params: {
                    user: data,
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
    bottomNavigation,
    data,
    isBlocked,
    isFavorite,
    isLoggedIn,
    isMuted,
    profilePublicData?.header.userID,
    seamailCreateHandler,
  ]);

  useEffect(() => {
    bottomNavigation.setOptions({
      headerRight: getNavButtons,
    });
    // Reset the mute/block state before re-determining.
    setIsFavorite(false);
    setIsMuted(false);
    setIsBlocked(false);
    // Determine if the user should be blocked, muted, etc.
    favorites.map(favoriteUserHeader => {
      if (favoriteUserHeader.userID === route.params.userID) {
        setIsFavorite(true);
      }
    });
    mutes.map(mutedUserHeader => {
      if (mutedUserHeader.userID === route.params.userID) {
        setIsMuted(true);
      }
    });
    blocks.map(blockedUserHeader => {
      if (blockedUserHeader.userID === route.params.userID) {
        setIsBlocked(true);
      }
    });
  }, [blocks, favorites, getNavButtons, mutes, bottomNavigation, route.params.userID]);

  const styles = {
    listContentCenter: [commonStyles.flexRow, commonStyles.justifyCenter],
    button: [commonStyles.marginHorizontalSmall],
  };

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (!data) {
    return <LoadingView />;
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
          <UserProfileAvatar user={data} />
        </PaddedContentView>
        <PaddedContentView style={[styles.listContentCenter]}>
          <Text selectable={true} variant={'headlineMedium'}>
            {isFavorite && (
              <>
                <AppIcon icon={'star'} />
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
                bottomNavigation.navigate(BottomTabComponents.homeTab, {
                  screen: MainStackComponents.userPrivateNoteScreen,
                  params: {
                    user: data,
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
