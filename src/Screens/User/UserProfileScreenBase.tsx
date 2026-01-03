import Clipboard from '@react-native-clipboard/clipboard';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {BlockedOrMutedBanner} from '#src/Components/Banners/BlockedOrMutedBanner';
import {HeaderProfileFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderProfileFavoriteButton';
import {HeaderProfileSeamailButton} from '#src/Components/Buttons/HeaderButtons/HeaderProfileSeamailButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {UserAboutCard} from '#src/Components/Cards/UserProfile/UserAboutCard';
import {UserContentCard} from '#src/Components/Cards/UserProfile/UserContentCard';
import {UserNoteCard} from '#src/Components/Cards/UserProfile/UserNoteCard';
import {UserProfileCard} from '#src/Components/Cards/UserProfile/UserProfileCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserProfileScreenActionsMenu} from '#src/Components/Menus/User/UserProfileScreenActionsMenu';
import {UserProfileSelfActionsMenu} from '#src/Components/Menus/User/UserProfileSelfActionsMenu';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ErrorView} from '#src/Components/Views/Static/ErrorView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {UserProfileAvatar} from '#src/Components/Views/UserProfileAvatar';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface Props {
  data?: ProfilePublicData;
  refetch: () => Promise<any>;
  isLoading: boolean;
  enableContent?: boolean;
}

export const UserProfileScreenBase = (props: Props) => {
  return (
    <LoggedInScreen>
      <UserProfileScreenBaseInner {...props} />
    </LoggedInScreen>
  );
};

const UserProfileScreenBaseInner = ({data, refetch, isLoading, enableContent = true}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {data: profilePublicData, refetch: refetchSelf} = useUserProfileQuery();
  const {commonStyles} = useStyles();
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const commonNavigation = useCommonStack();
  const {refetch: refetchFavorites} = useUserFavoritesQuery();
  const {data: mutes, refetch: refetchMutes} = useUserMutesQuery();
  const {data: blocks, refetch: refetchBlocks} = useUserBlocksQuery();
  const {appConfig} = useConfig();

  const isSelf = data?.header.userID === profilePublicData?.header.userID;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    let refreshes = [refetch()];
    if (!appConfig.preRegistrationMode) {
      refreshes.push(refetchFavorites(), refetchMutes(), refetchBlocks());
    }
    if (isSelf) {
      refreshes.push(refetchSelf());
    }
    await Promise.all(refreshes);
    setRefreshing(false);
  }, [refetch, refetchFavorites, refetchMutes, refetchBlocks, isSelf, refetchSelf, appConfig.preRegistrationMode]);

  const getNavButtons = useCallback(() => {
    if (data && isSelf) {
      return (
        <View>
          <MaterialHeaderButtons left>
            <Item
              title={'Edit'}
              iconName={AppIcons.edituser}
              onPress={() => commonNavigation.push(CommonStackComponents.userProfileEditScreen, {user: data})}
            />
            <UserProfileSelfActionsMenu userID={data.header.userID} />
          </MaterialHeaderButtons>
        </View>
      );
    }
    return (
      <View>
        <MaterialHeaderButtons>
          {data && (
            <>
              <HeaderProfileSeamailButton profile={data} />
              <HeaderProfileFavoriteButton profile={data} />
              <UserProfileScreenActionsMenu profile={data} isMuted={isMuted} isBlocked={isBlocked} />
            </>
          )}
        </MaterialHeaderButtons>
      </View>
    );
  }, [data, isSelf, isMuted, isBlocked, commonNavigation]);

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
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
