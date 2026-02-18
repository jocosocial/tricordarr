import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ClearSearchHelpTopicView} from '#src/Components/Views/Help/Common/ClearSearchHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {SearchBarHelpTopicView} from '#src/Components/Views/Help/Common/SearchBarHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ForumPostSearchHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Search for forum posts by keyword. If you initiate the search from a specific category or thread, results
            will be limited to that scope. Otherwise, results will include posts from all forums.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Search'}>
          <SearchBarHelpTopicView />
          <ClearSearchHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
