import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.siteUIHelpScreen>;

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
          The back button in the header will take you back to the previous screen, not back like in your browser. Use
          your device back button or gesture to navigate around the webview.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
