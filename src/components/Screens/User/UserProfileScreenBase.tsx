import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {UserProfileScreenActionsMenu} from '../../Menus/User/UserProfileScreenActionsMenu.tsx';
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
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import Clipboard from '@react-native-clipboard/clipboard';
import {UserProfileAvatar} from '../../Views/UserProfileAvatar';
import {ErrorView} from '../../Views/Static/ErrorView';
import {useAppTheme} from '../../../styles/Theme';
import {UserBylineTag} from '../../Text/Tags/UserBylineTag';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {HeaderProfileFavoriteButton} from '../../Buttons/HeaderButtons/HeaderProfileFavoriteButton.tsx';
import {HeaderProfileSeamailButton} from '../../Buttons/HeaderButtons/HeaderProfileSeamailButton.tsx';
import {UserProfileSelfActionsMenu} from '../../Menus/User/UserProfileSelfActionsMenu.tsx';
import {StyleSheet} from 'react-native';

interface UserProfileScreenBaseProps {
  data?: ProfilePublicData;
  refetch: () => Promise<any>;
  isLoading: boolean;
  enableContent?: boolean;
  oobe?: boolean;
}
export const UserProfileScreenBase = ({
  data,
  refetch,
  isLoading,
  enableContent = true,
  oobe = false,
}: UserProfileScreenBaseProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const {profilePublicData} = useUserData();
  const {commonStyles} = useStyles();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const {mutes, refetchMutes, blocks, refetchBlocks, favorites, refetchFavorites} = useUserRelations();
  const commonNavigation = useCommonStack();
  const {isLoggedIn} = useAuth();
  const theme = useAppTheme();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFavorites(), refetchMutes(), refetchBlocks()]);
    setRefreshing(false);
  }, [refetch, refetchFavorites, refetchMutes, refetchBlocks]);

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    if (data && data?.header.userID === profilePublicData?.header.userID) {
      return (
        <View>
          <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
            <Item
              title={'Edit'}
              iconName={AppIcons.edituser}
              onPress={() =>
                commonNavigation.push(CommonStackComponents.userProfileEditScreen, {user: data, oobe: oobe})
              }
            />
            <UserProfileSelfActionsMenu />
          </HeaderButtons>
        </View>
      );
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {data && (
            <>
              <HeaderProfileSeamailButton profile={data} />
              <HeaderProfileFavoriteButton profile={data} />
              <UserProfileScreenActionsMenu profile={data} isMuted={isMuted} isBlocked={isBlocked} oobe={oobe} />
            </>
          )}
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn, data, profilePublicData?.header.userID, isMuted, isBlocked, commonNavigation]);

  useEffect(() => {
    commonNavigation.setOptions({
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
  }, [blocks, favorites, getNavButtons, mutes, commonNavigation, data]);

  const styles = StyleSheet.create({
    listContentCenter: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
    },
    button: {
      ...commonStyles.marginHorizontalSmall,
    },
    titleText: {
      ...commonStyles.textCenter,
    },
  });

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
    <AppView safeEdges={oobe ? ['bottom'] : []}>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <BlockedOrMutedBanner muted={isMuted} blocked={isBlocked} />
        {data.message && (
          <PaddedContentView padTop={true} padBottom={false} style={styles.listContentCenter}>
            <Text selectable={true}>{data.message}</Text>
          </PaddedContentView>
        )}
        <PaddedContentView padTop={true} style={styles.listContentCenter}>
          <UserProfileAvatar user={data} setRefreshing={setRefreshing} />
        </PaddedContentView>
        <PaddedContentView style={styles.listContentCenter}>
          <Text selectable={true} variant={'headlineMedium'} style={styles.titleText}>
            {isFavorite && (
              <>
                <AppIcon color={theme.colors.twitarrYellow} icon={'star'} />
                &nbsp;
              </>
            )}
            <UserBylineTag user={data.header} includePronoun={false} variant={'headlineMedium'} />
          </Text>
        </PaddedContentView>
        {data.note && (
          <PaddedContentView>
            <UserNoteCard
              user={data}
              onPress={() => commonNavigation.push(CommonStackComponents.userPrivateNoteScreen, {user: data})}
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
        {enableContent && (
          <PaddedContentView>
            <UserContentCard user={data} />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
