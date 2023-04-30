import React, {useCallback, useEffect, useState} from 'react';
import {Card, Text, List} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {ProfilePublicData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControl, View} from 'react-native';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {LoadingView} from '../../Views/Static/LoadingView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppImage} from '../../Images/AppImage';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {UserProfileActionsMenu} from '../../Menus/UserProfileActionsMenu';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {BlockedOrMutedBanner} from '../../Banners/BlockedOrMutedBanner';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {UserContentCard} from '../../Cards/UserProfile/UserContentCard';
import {UserAboutCard} from '../../Cards/UserProfile/UserAboutCard';
import {UserProfileCard} from '../../Cards/UserProfile/UserProfileCard';
import {UserNoteCard} from '../../Cards/UserProfile/UserNoteCard';
import {AppIcon} from '../../Images/AppIcon';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.userProfileScreen,
  NavigatorIDs.userStack
>;

export const UserProfileScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn, profilePublicData} = useUserData();
  const {commonStyles} = useStyles();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const {mutes, refetchMutes, blocks, refetchBlocks, favorites, refetchFavorites} = useUserRelations();

  console.log('Mutes are', mutes);

  const {data, refetch} = useQuery<ProfilePublicData>({
    queryKey: [`/users/${route.params.userID}/profile`],
    enabled: isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => refetchFavorites())
      .then(() => refetchMutes())
      .then(() => refetchBlocks())
      .finally(() => setRefreshing(false));
  }, [refetch, refetchFavorites, refetchMutes, refetchBlocks]);

  const seamailCreateHandler = useCallback(() => {
    navigation.push(SeamailStackScreenComponents.seamailCreateScreen, {
      initialUserHeader: data?.header,
    });
  }, [data?.header, navigation]);

  const krakentalkCreateHandler = useCallback(() => {
    navigation.push(SeamailStackScreenComponents.krakentalkCreateScreen, {
      initialUserHeader: data?.header,
    });
  }, [data?.header, navigation]);

  const getNavButtons = useCallback(() => {
    if (data?.header.userID === profilePublicData.header.userID) {
      // Maybe have an edit button?
      return (
        <View style={[commonStyles.flexRow]}>
          <NavBarIconButton icon={AppIcons.edituser} onPress={() => console.log('edit profile!')} />
        </View>
      );
    }
    return (
      <View style={[commonStyles.flexRow]}>
        {data && <NavBarIconButton icon={AppIcons.seamailCreate} onPress={seamailCreateHandler} />}
        {data && <NavBarIconButton icon={AppIcons.krakentalkCreate} onPress={krakentalkCreateHandler} />}
        {data && (
          <UserProfileActionsMenu profile={data} isFavorite={isFavorite} isMuted={isMuted} isBlocked={isBlocked} />
        )}
      </View>
    );
  }, [
    commonStyles.flexRow,
    data,
    isBlocked,
    isFavorite,
    isMuted,
    krakentalkCreateHandler,
    profilePublicData.header.userID,
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
  }, [blocks, favorites, getNavButtons, mutes, navigation, route.params.userID]);

  const styles = {
    image: [commonStyles.roundedBorderLarge, commonStyles.headerImage],
    listContentCenter: [commonStyles.flexRow, commonStyles.justifyCenter],
    button: [commonStyles.marginHorizontalSmall],
  };

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
          <AppImage style={styles.image} path={`/image/user/thumb/${route.params.userID}`} />
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
            <UserNoteCard user={data} />
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
