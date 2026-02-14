import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {EventLocationHelpChapterView} from '#src/Components/Views/Help/Common/EventLocationHelpChapterView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const LfgCreateHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true} isStack={true}>
        <EventLocationHelpChapterView />
        <HelpChapterTitleView title={'Maximum Attendees Desired'}>
          <HelpTopicView>Use 0 for unlimited</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Misc'}>
          <HelpTopicView>
            If you just created an LFG and can't seem to find it in the list, ensure that you are looking at the "Owned
            LFGs" list and not the "Find LFGs" list.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
