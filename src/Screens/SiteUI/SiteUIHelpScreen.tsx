import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.siteUIHelpScreen>;

export const SiteUIHelpScreen = ({route}: Props) => {
  return (
    <AppView safeEdges={route.params?.oobe ? ['bottom'] : []}>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Not all features of Twitarr have been implemented in this app. Those that aren't are outsourced to an
          integrated browser with the Twitarr website. The first time you may need to log in since that uses a different
          authentication method. You can also use the web view in the app as a dedicated browser for Twitarr. You can
          access the webview directly in the Drawer.
        </HelpTopicView>
        <HelpChapterTitleView title={'Header Buttons'} />
        <HelpTopicView title={'Home'} icon={AppIcons.home}>
          Takes the webview back to the root URL of the server (example: https://twitarr.com)
        </HelpTopicView>
        <HelpTopicView title={'Reload'} icon={AppIcons.reload}>
          Refresh the webview at the current URL, whatever it may be.
        </HelpTopicView>
        <HelpTopicView title={'Back'} icon={AppIcons.back}>
          The back button in the header will take you back in the webview, then to the previous screen in the app.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
