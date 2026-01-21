import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const SiteUIHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Not all features of Twitarr have been implemented in this app. Those that aren't are outsourced to an
          integrated browser to the Twitarr website. You can also use the web view in the app as a dedicated browser for
          Twitarr. You can access the webview directly in the Drawer.
        </HelpTopicView>
        <HelpChapterTitleView title={'Header Buttons'} />
        <HelpTopicView title={'Reload'} icon={AppIcons.reload}>
          Refresh the webview at the current URL, whatever it may be.
        </HelpTopicView>
        <HelpTopicView title={'Back'} icon={AppIcons.back}>
          The standard back button in the header will take you back in the webview, then to the previous screen in the
          app. If you're at the Today screen in the webview it will navigate back in the app regardless of history.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView title={'Home'} icon={AppIcons.home}>
          Takes the webview back to the root URL of the server (example: https://twitarr.com)
        </HelpTopicView>
        <HelpTopicView title={'Open in Browser'} icon={AppIcons.webview}>
          Open the current URL in the devices system browser.
        </HelpTopicView>
        <ShareButtonHelpTopicView />
        <HelpTopicView title={'Clear Cookies'} icon={AppIcons.close}>
          Clear cookies within the webview. This may be useful if it gets into a weird state.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
