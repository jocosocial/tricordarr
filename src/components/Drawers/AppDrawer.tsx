import * as React from 'react';
import {Drawer} from 'react-native-drawer-layout';
import {Drawer as PaperDrawer} from 'react-native-paper';
import {useDrawer} from '../Context/Contexts/DrawerContext';
import {PropsWithChildren} from 'react';
import {Linking, ScrollView} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useAppTheme} from '../../styles/Theme';

export const AppDrawer = ({children}: PropsWithChildren) => {
  const {drawerOpen, setDrawerOpen} = useDrawer();
  const theme = useAppTheme();

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
            <PaperDrawer.Section title={'Users'} showDivider={false}>
              <PaperDrawer.Item
                label={'Your Profile'}
                icon={AppIcons.user}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab`)}
              />
              <PaperDrawer.Item
                label={'Directory'}
                icon={AppIcons.group}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/directory`)}
              />
              <PaperDrawer.Item
                label={'Muted/Blocked Users'}
                icon={AppIcons.block}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/blocks`)}
              />
            </PaperDrawer.Section>
            <PaperDrawer.Section title={'Communication'} showDivider={false}>
              <PaperDrawer.Item
                label={'Alert/Mute Keywords'}
                icon={AppIcons.alertword}
                onPress={() => handleDrawerNav(`tricordarr://twitarrtab/${Date.now()}/alertwords`)}
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
                onPress={() => handleDrawerNav('tricordarr://')}
              />
              <PaperDrawer.Item
                label={'Seamail'}
                icon={AppIcons.seamail}
                onPress={() => handleDrawerNav('tricordarr://seamail')}
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
          </ScrollView>
        );
      }}>
      {children}
    </Drawer>
  );
};
