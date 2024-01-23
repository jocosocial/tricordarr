import React, {PropsWithChildren} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FAB, IconButton, Text} from 'react-native-paper';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {BoldText} from '../../Text/BoldText';
import {BaseFABGroup} from '../../Buttons/FloatingActionButtons/BaseFABGroup';
import {useAppTheme} from '../../../styles/Theme';

const SectionView = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={commonStyles.marginBottomSmall}>{children}</View>;
};

const SectionContent = ({children}: PropsWithChildren) => {
  const {commonStyles} = useStyles();
  return <View style={commonStyles.flexRow}>{children}</View>;
};

export const MainHelpScreen = () => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const onStateChange = ({open}: {open: boolean}) => console.log({open});

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Context Menu</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.menu} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Most screens have a menu that gives you extra options. Look for in the upper right corner of the screen.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Floating Action Button</BoldText>
          </SectionView>
          <SectionContent>
            <View style={commonStyles.marginRightSmall}>
              <FAB
                visible={true}
                icon={AppIcons.new}
                color={theme.colors.inverseOnSurface}
                style={{backgroundColor: theme.colors.inverseSurface}}
              />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Some screens have a floating action button in the lower right corner. This is often used to create new
                objects or access other views.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Drawer</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.drawer} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                The drawer contains minor features of the app, documentation, and more. It can be accessed through a
                button in the top left of some screens.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Moderator Actions</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.moderator} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Moderator-only actions are indicated with this moderator icon. They will only appear for users with
                moderator privileges.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Refresh</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.reload} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Most screens have a typical pull-to-refresh ability. But some have a dedicated button.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Twitarr Webview</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.webview} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Not all features of Twitarr have been implemented in this app. Those that aren't are outsourced
                to an integrated browser with the Twitarr website. The first time you may need to log in since that
                uses a different authentication method. You can also use the web view in the app as a dedicated
                browser for Twitarr. You can access the webview directly in the Drawer.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
