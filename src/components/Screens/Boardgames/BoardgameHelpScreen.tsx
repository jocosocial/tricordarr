import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';

export const BoardgameHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'Board Games'} />
        <HelpTopicView>
          Play time is the manufacturers specification. JoCo Cruise recommends adding 20-30 minutes if your party has
          not played before.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
