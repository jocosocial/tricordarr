import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const EasterEggHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          During a Gold Team show in 2025, Paul Sabourin made a remark "Gold Team, you're sassy". And in a perfect
          moment of silence cruise veteran Kyle Huck (kyellabella) shouted "YEAH!". And thus a meme was born.
        </HelpTopicView>
        <HelpTopicView>This audio clip was extracted from a recording made by Angela Brett.</HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
