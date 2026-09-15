import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ClearSearchHelpTopicView} from '#src/Components/Views/Help/Common/ClearSearchHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {SearchBarHelpTopicView} from '#src/Components/Views/Help/Common/SearchBarHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const SeamailSearchHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The search screen allows you to search through your joined chats by keyword: Seamail, and optionally private
            event and LFG conversations depending on Chat Settings. Search results will include conversations where the
            search term appears in the subject line or message content. Results use the same type filter as the Seamail
            list.
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
