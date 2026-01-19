import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ClearSearchHelpTopicView} from '#src/Components/Views/Help/Common/ClearSearchHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {PullToRefreshHelpTopicView} from '#src/Components/Views/Help/Common/PullToRefreshHelpTopicView';
import {SearchBarHelpTopicView} from '#src/Components/Views/Help/Common/SearchBarHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const SeamailSearchHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The seamail search screen allows you to search through all your seamail conversations by keyword. Search
            results will include conversations where the search term appears in the subject line or message content.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Search'}>
          <SearchBarHelpTopicView />
          <ClearSearchHelpTopicView />
          <PullToRefreshHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
