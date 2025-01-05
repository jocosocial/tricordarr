import * as React from 'react';
import {Drawer} from 'react-native-drawer-layout';
import {Badge, Drawer as PaperDrawer} from 'react-native-paper';
import {useDrawer} from '../Context/Contexts/DrawerContext';
import {PropsWithChildren} from 'react';
import {Linking, ScrollView} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useAppTheme} from '../../styles/Theme';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {useUserNotificationDataQuery} from '../Queries/Alert/NotificationQueries';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {StyleSheet} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

export const AppDrawer = ({children}: PropsWithChildren) => {
  const {drawerOpen, setDrawerOpen} = useDrawer();
  const theme = useAppTheme();
  const {hasTwitarrTeam, hasModerator, hasVerified} = usePrivilege();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  const {tokenData} = useAuth();
  const {profilePublicData} = useUserData();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    drawer: {
      ...commonStyles.background,
      ...commonStyles.safePaddingVertical,
    },
  });

  const handleDrawerNav = (url: string) => {
    Linking.openURL(url);
    setDrawerOpen(false);
  };

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
                    onPress={() => handleDrawerNav(`tricordarr://user/${tokenData?.userID}`)}
                  />
                  <PaperDrawer.Item
                    label={'Directory'}
                    icon={AppIcons.group}
                    onPress={() => handleDrawerNav('tricordarr://users')}
                  />
                </>
              )}
              <PaperDrawer.Item
                label={'Performers'}
                icon={AppIcons.performer}
                onPress={() => handleDrawerNav('tricordarr://performers')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Entertainment'} showDivider={false}>
              {hasVerified && (
                <PaperDrawer.Item
                  label={'Photo Stream'}
                  icon={AppIcons.photostream}
                  onPress={() => handleDrawerNav('tricordarr://photostream')}
                />
              )}
              {/*This is Beta!*/}
              {hasVerified && appConfig.enableDeveloperOptions && (
                <PaperDrawer.Item
                  label={'Micro Karaoke'}
                  icon={AppIcons.microKaraoke}
                  onPress={() => handleDrawerNav('tricordarr://microkaraoke')}
                />
              )}
              <PaperDrawer.Item
                label={'Board Games'}
                icon={AppIcons.games}
                onPress={() => handleDrawerNav('tricordarr://boardgames')}
              />
              <PaperDrawer.Item
                label={'Karaoke'}
                icon={AppIcons.karaoke}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/karaoke`)}
              />
              <PaperDrawer.Item
                label={'Lighter'}
                icon={AppIcons.lighter}
                onPress={() => handleDrawerNav('tricordarr://lighter')}
              />
              <PaperDrawer.Item
                label={'Daily Themes'}
                icon={AppIcons.dailyTheme}
                onPress={() => handleDrawerNav('tricordarr://dailyThemes')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Documentation'} showDivider={false}>
              <PaperDrawer.Item
                label={'Deck Map'}
                icon={AppIcons.map}
                onPress={() => handleDrawerNav('tricordarr://map')}
              />
              <PaperDrawer.Item
                label={'Time Zones'}
                icon={AppIcons.time}
                onPress={() => handleDrawerNav('tricordarr://time')}
              />
              <PaperDrawer.Item
                label={'JoCo Cruise FAQ'}
                icon={AppIcons.faq}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/faq`)}
              />
              <PaperDrawer.Item
                label={'Code of Conduct'}
                icon={AppIcons.codeofconduct}
                onPress={() => handleDrawerNav('tricordarr://codeOfConduct')}
              />
              <PaperDrawer.Item
                label={'About Twitarr (Service)'}
                icon={AppIcons.twitarr}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/about`)}
              />
              <PaperDrawer.Item
                label={'About Tricordarr (App)'}
                icon={AppIcons.tricordarr}
                onPress={() => handleDrawerNav('tricordarr://about')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Advanced'} showDivider={false}>
              <PaperDrawer.Item
                label={'Settings'}
                icon={AppIcons.settings}
                onPress={() => handleDrawerNav('tricordarr://settings')}
              />
              <PaperDrawer.Item
                label={'Twitarr Web UI'}
                icon={AppIcons.webview}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}`)}
              />
              {hasModerator && (
                <PaperDrawer.Item
                  label={'Moderator Actions'}
                  icon={AppIcons.moderator}
                  onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/moderator`)}
                  right={getModBadge}
                />
              )}
              {hasTwitarrTeam && (
                <PaperDrawer.Item
                  label={'Server Admin'}
                  icon={AppIcons.twitarteam}
                  onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/admin`)}
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
