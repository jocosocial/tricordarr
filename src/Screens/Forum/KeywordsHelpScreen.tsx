import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AlertKeywordsHelpTopicView} from '#src/Components/Views/Help/Common/AlertKeywordsHelpTopicView';
import {MuteKeywordsHelpTopicView} from '#src/Components/Views/Help/Common/MuteKeywordsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';

export const KeywordsHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <MuteKeywordsHelpTopicView />
          <AlertKeywordsHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
