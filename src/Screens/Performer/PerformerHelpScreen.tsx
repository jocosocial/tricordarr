import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OfficialPerformersHelpTopicView} from '#src/Components/Views/Help/Common/OfficialPerformersHelpTopicView';
import {ShadowPerformerProfilesHelpTopicView} from '#src/Components/Views/Help/Common/ShadowPerformerProfilesHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const PerformerHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <OfficialPerformersHelpTopicView />
        <HelpTopicView title={'Shadow Performers'}>
          These are attendees just like you! They have something cool to share and are volunteering their vacation time
          to share it.
        </HelpTopicView>
        <ShadowPerformerProfilesHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
