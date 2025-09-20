import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {FAB} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {View} from 'react-native';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {HelpTopicView} from '#src/Views/Help/HelpTopicView.tsx';
import {HelpChapterTitleView} from '#src/Views/Help/HelpChapterTitleView.tsx';

export const MainHelpScreen = () => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Header Buttons'} />
        <HelpTopicView title={'Drawer'} icon={AppIcons.drawer}>
          The drawer contains minor features of the app, documentation, and more. It can be accessed through a button in
          the top left of some screens.
        </HelpTopicView>
        <HelpTopicView title={'Context Menu'} icon={AppIcons.menu}>
          Most screens have a menu that gives you extra options. Look for in the upper right corner of the screen.
        </HelpTopicView>
        <HelpTopicView title={'Sort'} icon={AppIcons.sort}>
          Some lists can be sorted by different criteria. Tap this icon to access a menu of sorting options. Sometimes
          you can long press to go back to the default.
        </HelpTopicView>
        <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
          Some lists can be filtered. Tap this icon to access a menu of filtering options. You can long press the filter
          icon to clear any active filters.
        </HelpTopicView>
        <HelpTopicView title={'Search'} icon={AppIcons.search}>
          Most content is searchable. Look for a magnifying glass icon around the header menu. There may be different
          modes of search.
        </HelpTopicView>
        <HelpChapterTitleView title={'Content'} />
        <HelpTopicView
          title={'Floating Action Button'}
          right={
            <View style={commonStyles.marginRightSmall}>
              <FAB
                visible={true}
                icon={AppIcons.new}
                color={theme.colors.inverseOnSurface}
                style={{backgroundColor: theme.colors.inverseSurface}}
              />
            </View>
          }>
          Some screens have a floating action button in the lower right corner. This is often used to create new objects
          or access other views.
        </HelpTopicView>
        <HelpTopicView title={'Refresh'} icon={AppIcons.reload}>
          Most screens have a typical pull-to-refresh ability. But some have a dedicated button.
        </HelpTopicView>
        <HelpTopicView title={'Long Press'}>
          Most items in a list can be long-pressed to open a menu of additional context-specific actions.
        </HelpTopicView>
        <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
          Some items like events, forum posts, forum threads, and users can be "favorited" which just makes them a bit
          easier to access.
        </HelpTopicView>
        <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
          Seamail conversations can be muted to prevent generating notifications. Forum threads can sends them to the
          bottom of the list so you don't see activity in them. Users can be muted so that you don't see content from
          them.
        </HelpTopicView>
        <HelpTopicView title={'Report'} icon={AppIcons.report}>
          Nearly all content can be reported to the moderators. Use this to report instances of violations of the Code
          of Conduct or other potential misbehavior. The moderator team will follow up with you usually within 24 hours.
        </HelpTopicView>
        <HelpTopicView title={'Moderator Actions'} icon={AppIcons.moderator}>
          Moderator-only actions are indicated with this moderator icon. They will only appear for users with moderator
          privileges.{' '}
        </HelpTopicView>
        <HelpChapterTitleView title={'Other'} />
        <HelpTopicView title={'Twitarr Webview'} icon={AppIcons.webview}>
          Not all features of Twitarr have been implemented in this app. Those that aren't are outsourced to an
          integrated browser with the Twitarr website. The first time you may need to log in since that uses a different
          authentication method. You can also use the web view in the app as a dedicated browser for Twitarr. You can
          access the webview directly in the Drawer.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
