import * as React from 'react';
import {Drawer} from 'react-native-drawer-layout';
import {Drawer as PaperDrawer} from 'react-native-paper';
import {useDrawer} from '../Context/Contexts/DrawerContext';
import {PropsWithChildren} from 'react';
import {Linking, ScrollView} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useAppTheme} from '../../styles/Theme';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const AppDrawer = ({children}: PropsWithChildren) => {
  const {drawerOpen, setDrawerOpen} = useDrawer();
  const theme = useAppTheme();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const {profilePublicData} = useUserData();

  const handleDrawerNav = (url: string) => {
    Linking.openURL(url);
    setDrawerOpen(false);
  };

  return (
    <Drawer
      drawerStyle={{backgroundColor: theme.colors.background}}
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => {
        return (
          <ScrollView>
            <PaperDrawer.Section title={'User'} showDivider={false}>
              <PaperDrawer.Item
                label={'Your Profile'}
                icon={AppIcons.user}
                onPress={() => handleDrawerNav(`tricordarr://user/${profilePublicData?.header.userID}`)}
              />
              <PaperDrawer.Item
                label={'Directory'}
                icon={AppIcons.group}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/directory`)}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Entertainment'} showDivider={false}>
              <PaperDrawer.Item
                label={'Karaoke'}
                icon={AppIcons.karaoke}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/karaoke`)}
              />
              <PaperDrawer.Item
                label={'Board Games'}
                icon={AppIcons.games}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/boardgames`)}
              />
              <PaperDrawer.Item
                label={'Lighter'}
                icon={AppIcons.lighter}
                onPress={() => handleDrawerNav('tricordarr://lighter')}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Documentation'} showDivider={false}>
              <PaperDrawer.Item
                label={'Deck Map'}
                icon={AppIcons.map}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/map`)}
              />
              <PaperDrawer.Item
                label={'Time Zone Check'}
                icon={AppIcons.time}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/time`)}
              />
              <PaperDrawer.Item
                label={'JoCo Cruise FAQ'}
                icon={AppIcons.faq}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/faq`)}
              />
              <PaperDrawer.Item
                label={'Code of Conduct'}
                icon={AppIcons.codeofconduct}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/codeOfConduct`)}
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
                onPress={() => handleDrawerNav('tricordarr://settingstab')}
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
                />
              )}
              {hasTwitarrTeam && (
                <PaperDrawer.Item
                  label={'Server Admin'}
                  icon={AppIcons.twitarteam}
                  onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/admin`)}
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
