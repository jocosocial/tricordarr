import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {DailyThemeHelpTopicView} from '#src/Components/Views/Help/Common/DailyThemeHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';

export const DailyThemeHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Daily Themes'}>
          <DailyThemeHelpTopicView showTitle={false} />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
