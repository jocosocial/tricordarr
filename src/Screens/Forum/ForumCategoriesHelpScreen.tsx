import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AlertKeywordsHelpTopicView} from '#src/Components/Views/Help/Common/AlertKeywordsHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {MuteKeywordsHelpTopicView} from '#src/Components/Views/Help/Common/MuteKeywordsHelpTopicView';
import {ForumSearchPostsHelpTopicView} from '#src/Components/Views/Help/Forum/ForumSearchPostsHelpTopicView';
import {ForumSearchThreadsHelpTopicView} from '#src/Components/Views/Help/Forum/ForumSearchThreadsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ForumCategoriesHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The forum categories screen shows all available forum categories. They are organized into two groups:
          </HelpTopicView>
          <HelpTopicView title={'Forum'}>
            This contains general discussion topics such as activities, memes, help desk, etc.
          </HelpTopicView>
          <HelpTopicView title={'Personal'}>
            These are threads (or collections of posts) that relate specifically to you such as favorites, recently
            viewed, and your own posts.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <ForumSearchThreadsHelpTopicView />
          <ForumSearchPostsHelpTopicView />
          <MuteKeywordsHelpTopicView />
          <AlertKeywordsHelpTopicView />
          <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
            Access forum settings to configure sorting preferences, alert word highlighting, and push notifications.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
