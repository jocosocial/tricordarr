import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ClearSearchHelpTopicView} from '#src/Components/Views/Help/Common/ClearSearchHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {PullToRefreshHelpTopicView} from '#src/Components/Views/Help/Common/PullToRefreshHelpTopicView';
import {SearchBarHelpTopicView} from '#src/Components/Views/Help/Common/SearchBarHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ForumThreadSearchHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Search for forum threads by keyword. If you initiate the search from a specific category, results will be
            limited to that category. Otherwise, results will include threads from all categories.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Search'}>
          <SearchBarHelpTopicView />
          <ClearSearchHelpTopicView />
          <PullToRefreshHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Sort'} icon={AppIcons.sort}>
            Change the sort order of search results. Options include sorting by most recent post, creation date, or
            title.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
