import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ModeratorHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView icon={AppIcons.moderator}>
          The moderator icon indicates a moderator action that you can take. Most moderator actions will open in a
          built-in webview which may require you to log in a second time.
        </HelpTopicView>
        <HelpChapterTitleView title={'Posting'} />
        <HelpTopicView>
          When you are posting as Moderator the post button will be a different color. In some circumstances you will
          also see a red banner at the top of the screen.
        </HelpTopicView>
        <HelpChapterTitleView title={'More Information'} />
        <HelpTopicView>
          There is an entire moderation guide, activity log, and more available in the "Moderator Actions" button in the
          app drawer.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
