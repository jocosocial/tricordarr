import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const DisabledHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Feature Disabled'} />
        <HelpTopicView>
          This feature has been temporarily disabled by the TwitarrTeam and/or THO. This can happen for social or
          technical reasons. It's nothing you did and there is nothing you can do about it.
        </HelpTopicView>
        <HelpChapterTitleView title={'What You Can Do'} />
        <HelpTopicView>
          You can check the website directly to see if the feature is available there. If the feature works on the
          website but not in the app, it's likely that a critical bug in the app was discovered and the feature was
          disabled as a precautionary measure. You can also contact the TwitarrTeam and/or THO if you have questions.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
