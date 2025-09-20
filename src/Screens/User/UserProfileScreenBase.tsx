import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '#src/Views/AppView.tsx';
import {ProfilePublicData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {UserProfileScreenActionsMenu} from '#src/Menus/User/UserProfileScreenActionsMenu.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {BlockedOrMutedBanner} from '#src/Banners/BlockedOrMutedBanner.tsx';
import {UserContentCard} from '#src/Cards/UserProfile/UserContentCard.tsx';
import {UserAboutCard} from '#src/Cards/UserProfile/UserAboutCard.tsx';
import {UserProfileCard} from '#src/Cards/UserProfile/UserProfileCard.tsx';
import {UserNoteCard} from '#src/Cards/UserProfile/UserNoteCard.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '#src/Views/Static/NotLoggedInView.tsx';
import Clipboard from '@react-native-clipboard/clipboard';
import {UserProfileAvatar} from '#src/Views/UserProfileAvatar.tsx';
import {ErrorView} from '#src/Views/Static/ErrorView.tsx';
import {UserBylineTag} from '#src/Text/Tags/UserBylineTag.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens.tsx';
import {HeaderProfileFavoriteButton} from '#src/Buttons/HeaderButtons/HeaderProfileFavoriteButton.tsx';
import {HeaderProfileSeamailButton} from '#src/Buttons/HeaderButtons/HeaderProfileSeamailButton.tsx';
import {UserProfileSelfActionsMenu} from '#src/Menus/User/UserProfileSelfActionsMenu.tsx';
import {StyleSheet} from 'react-native';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries.ts';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries.ts';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries.ts';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries.ts';

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
  const {data: profilePublicData, refetch: refetchSelf} = useUserProfileQuery();
  const {commonStyles} = useStyles();
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const commonNavigation = useCommonStack();
  const {isLoggedIn} = useAuth();
  const {refetch: refetchFavorites} = useUserFavoritesQuery();
  const {data: mutes, refetch: refetchMutes} = useUserMutesQuery();
  const {data: blocks, refetch: refetchBlocks} = useUserBlocksQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    let refreshes = [refetch(), refetchFavorites(), refetchMutes(), refetchBlocks()];
    if (data?.header.userID === profilePublicData?.header.userID) {
      refreshes.push(refetchSelf());
    }
    await Promise.all(refreshes);
    setRefreshing(false);
  }, [
    refetch,
    refetchFavorites,
    refetchMutes,
    refetchBlocks,
    data?.header.userID,
    profilePublicData?.header.userID,
    refetchSelf,
  ]);

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
  }, [isLoggedIn, data, profilePublicData?.header.userID, isMuted, isBlocked, oobe, commonNavigation]);

  useEffect(() => {
    commonNavigation.setOptions({
      headerRight: getNavButtons,
    });
    // Reset the mute/block state before re-determining.
    setIsMuted(false);
    setIsBlocked(false);
    if (data) {
      // Determine if the user should be blocked, muted, etc.
      mutes?.map(mutedUserHeader => {
        if (mutedUserHeader.userID === data.header.userID) {
          setIsMuted(true);
        }
      });
      blocks?.map(blockedUserHeader => {
        if (blockedUserHeader.userID === data.header.userID) {
          setIsBlocked(true);
        }
      });
    }
  }, [blocks, getNavButtons, mutes, commonNavigation, data]);

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
