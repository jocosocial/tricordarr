import React, {PropsWithChildren} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FAB, IconButton, Text} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {BoldText} from '../../Text/BoldText';
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
              <Text>Most screens have a typical pull-to-refresh ability. But some have a dedicated button.</Text>
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
                Not all features of Twitarr have been implemented in this app. Those that aren't are outsourced to an
                integrated browser with the Twitarr website. The first time you may need to log in since that uses a
                different authentication method. You can also use the web view in the app as a dedicated browser for
                Twitarr. You can access the webview directly in the Drawer.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Long Press</BoldText>
          </SectionView>
          <SectionContent>
            <View style={commonStyles.flex}>
              <Text>
                Most items in a list can be long-pressed to open a menu of additional context-specific actions.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Favorite</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.favorite} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Some items like events, forum posts, forum threads, and users can be "favorited" which just makes them a
                bit easier to access.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Mute</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.mute} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Seamail conversations can be muted to prevent generating notifications. Forum threads can sends them to
                the bottom of the list so you don't see activity in them. Users can be muted so that you don't see
                content from them.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Sort</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.sort} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Some lists can be sorted by different criteria. Tap this icon to access a menu of sorting options.
                Sometimes you can long press to go back to the default.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
        <PaddedContentView>
          <SectionView>
            <BoldText>Filter</BoldText>
          </SectionView>
          <SectionContent>
            <View>
              <IconButton icon={AppIcons.filter} />
            </View>
            <View style={commonStyles.flex}>
              <Text>
                Some lists can be filtered. Tap this icon to access a menu of filtering options. You can long press the
                filter icon to clear any active filters.
              </Text>
            </View>
          </SectionContent>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
