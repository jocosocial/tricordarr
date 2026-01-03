import {useNavigation} from '@react-navigation/native';
import * as React from 'react';
import {PropsWithChildren, useEffect} from 'react';
import {Linking, ScrollView, StyleSheet} from 'react-native';
import {Drawer} from 'react-native-drawer-layout';
import {Badge, Drawer as PaperDrawer} from 'react-native-paper';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const AppDrawer = ({children}: PropsWithChildren) => {
  const {drawerOpen, setDrawerOpen} = useDrawer();
  const {oobeCompleted, appConfig} = useConfig();
  const {hasTwitarrTeam, hasModerator, hasVerified} = usePrivilege();
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const {data: userNotificationData} = useUserNotificationDataQuery({
    enabled: oobeCompleted && !appConfig.preRegistrationMode,
  });
  const {tokenData} = useAuth();
  const {data: profilePublicData} = useUserProfileQuery({enabled: oobeCompleted});
  const {commonStyles} = useStyles();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    drawer: {
      ...commonStyles.background,
      ...commonStyles.safePaddingVertical,
    },
  });

  /**
   * Close drawer when navigation events occur. Previously this was a function
   * that took a URL and closed the drawer. But that didn't account for tapping
   * a notification quick action (such as notification settings) which would
   * trigger a navigation event but would not close the drawer.
   */
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    const unsubscribe = navigation.addListener('state', () => {
      setDrawerOpen(false);
    });
    return unsubscribe;
  }, [navigation, drawerOpen, setDrawerOpen]);

  const getModBadge = () => {
    let count = 0;
    if (userNotificationData?.moderatorData) {
      count += userNotificationData.moderatorData.openReportCount;
      count += userNotificationData.moderatorData.newModeratorForumMentionCount;
    }
    if (count) {
      return <Badge>{count}</Badge>;
    }
  };

  const getTTBadge = () => {
    let count = 0;
    if (userNotificationData?.moderatorData) {
      count += userNotificationData.moderatorData.newTTForumMentionCount;
    }
    if (count) {
      return <Badge>{count}</Badge>;
    }
  };

  return (
    <Drawer
      drawerStyle={styles.drawer}
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      swipeEnabled={false}
      renderDrawerContent={() => {
        return (
          <ScrollView>
            <PaperDrawer.Section title={'Community'} showDivider={false}>
              {hasVerified && (
                <>
                  <PaperDrawer.Item
                    label={`Your Profile (${profilePublicData?.header.username})`}
                    icon={AppIcons.profile}
                    onPress={() => Linking.openURL(`tricordarr://user/${tokenData?.userID}`)}
                  />
                  <PaperDrawer.Item
                    label={'Directory'}
                    icon={AppIcons.group}
                    onPress={() => Linking.openURL('tricordarr://users')}
                  />
                  <PaperDrawer.Item
                    label={'Favorite Users'}
                    icon={AppIcons.userFavorite}
                    onPress={() => Linking.openURL('tricordarr://favorites')}
                  />
                </>
              )}
              <PaperDrawer.Item
                label={'Performers'}
                icon={AppIcons.performer}
                onPress={() => Linking.openURL('tricordarr://performers')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Entertainment'} showDivider={false}>
              {hasVerified && (
                <PaperDrawer.Item
                  label={'Photo Stream'}
                  icon={AppIcons.photostream}
                  onPress={() => Linking.openURL('tricordarr://photostream')}
                />
              )}
              {hasVerified && (
                <PaperDrawer.Item
                  label={'Micro Karaoke'}
                  icon={AppIcons.microKaraoke}
                  onPress={() => Linking.openURL('tricordarr://microkaraoke')}
                />
              )}
              <PaperDrawer.Item
                label={'Board Games'}
                icon={AppIcons.games}
                onPress={() => Linking.openURL('tricordarr://boardgames')}
              />
              <PaperDrawer.Item
                label={'Karaoke'}
                icon={AppIcons.karaoke}
                onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/karaoke`)}
              />
              <PaperDrawer.Item
                label={'Lighter'}
                icon={AppIcons.lighter}
                onPress={() => Linking.openURL('tricordarr://lighter')}
              />
              <PaperDrawer.Item
                label={'Daily Themes'}
                icon={AppIcons.dailyTheme}
                onPress={() => Linking.openURL('tricordarr://dailyThemes')}
              />
              <PaperDrawer.Item
                label={'Puzzle Hunts'}
                icon={AppIcons.hunts}
                onPress={() => Linking.openURL('tricordarr://hunts')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Documentation'} showDivider={false}>
              <PaperDrawer.Item
                label={'Deck Map'}
                icon={AppIcons.map}
                onPress={() => Linking.openURL('tricordarr://map')}
              />
              <PaperDrawer.Item
                label={'Time Zones'}
                icon={AppIcons.time}
                onPress={() => Linking.openURL('tricordarr://time')}
              />
              <PaperDrawer.Item
                label={'JoCo Cruise FAQ'}
                icon={AppIcons.faq}
                onPress={() => Linking.openURL('tricordarr://faq')}
              />
              <PaperDrawer.Item
                label={'Code of Conduct'}
                icon={AppIcons.codeofconduct}
                onPress={() => Linking.openURL('tricordarr://codeOfConduct')}
              />
              <PaperDrawer.Item
                label={'Shadow Host Form'}
                icon={AppIcons.feedback}
                onPress={() => Linking.openURL('tricordarr://eventfeedback')}
              />
              <PaperDrawer.Item
                label={'About Twitarr (Service)'}
                icon={AppIcons.twitarr}
                onPress={() => Linking.openURL('tricordarr://about')}
              />
              <PaperDrawer.Item
                label={'About Tricordarr (App)'}
                icon={AppIcons.tricordarr}
                onPress={() => Linking.openURL('tricordarr://about-app')}
              />
              <PaperDrawer.Item
                label={'Help Manual'}
                icon={AppIcons.help}
                onPress={() => Linking.openURL('tricordarr://help')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Advanced'} showDivider={false}>
              <PaperDrawer.Item
                label={'Settings'}
                icon={AppIcons.settings}
                onPress={() => Linking.openURL('tricordarr://settings')}
              />
              <PaperDrawer.Item
                label={'Twitarr Web UI'}
                icon={AppIcons.webview}
                onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}`)}
              />
              {hasShutternaut && (
                <PaperDrawer.Item
                  label={'Shutternaut Calendar'}
                  icon={AppIcons.shutternaut}
                  onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/dayplanner/shutternauts`)}
                />
              )}
              {hasShutternautManager && (
                <PaperDrawer.Item
                  label={'Manage Shutternauts'}
                  icon={AppIcons.shutternaut}
                  onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/userrole/shutternaut/manage`)}
                />
              )}
              {hasModerator && (
                <PaperDrawer.Item
                  label={'Moderator Actions'}
                  icon={AppIcons.moderator}
                  onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/moderator`)}
                  right={getModBadge}
                />
              )}
              {hasTwitarrTeam && (
                <PaperDrawer.Item
                  label={'Server Admin'}
                  icon={AppIcons.twitarteam}
                  onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/admin`)}
                  right={getTTBadge}
                />
              )}
            </PaperDrawer.Section>
          </ScrollView>
        );
      }}>
      {children}
    </Drawer>
  );
};
