import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const PreRegistrationHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Pre-Registration Mode'} />
        <HelpTopicView>
          Only limited user features are available in pre-registration mode. This is because there is no land-based
          moderation team. And the TwitarrTeam needs to finish packing.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
