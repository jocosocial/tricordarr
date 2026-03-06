import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ScheduleImportHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Import your Sched.com schedule favorites to Twitarr. This can give you a single pane of glass view for each
            day of the cruise. Just like with Sched, Twitarr is not a reservation system.
          </HelpTopicView>
          <HelpTopicView>
            You do NOT need to have an internet package to do this! Sched.com is allowed on ship wifi without a paid
            internet package.
          </HelpTopicView>
          <HelpTopicView>
            Your username is in the URL under the "Export Calendar" section at the bottom of the "Mobile App + iCal"
            screen on Sched.com.
          </HelpTopicView>
          <HelpTopicView>
            The import is additive-only. It will not unfavorite or otherwise "sync" your favorites between the two
            systems.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Prerequisites'}>
          <HelpTopicView>You must have already created a Sched.com account for JoCo Cruise this year.</HelpTopicView>
          <HelpTopicView>
            Your personal schedule must be public, meaning others can see you in the attendee list. This only needs to
            be set during the import. You can return your profile to private when you're done.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
