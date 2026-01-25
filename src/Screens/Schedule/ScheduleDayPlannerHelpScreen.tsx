import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
import {ScheduleDayButtonHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleDayButtonHelpTopicView';
import {ScheduleImportHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleImportHelpTopicView';
import {ScheduleSettingsHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleSettingsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ScheduleDayPlannerHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The Day Planner shows your events in a calendar-style view. This includes favorited events, personal events,
            and joined LFGs. Once you've picked your events, this is your main screen for keeping track of your days
            onboard.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Navigation'}>
          <ScheduleDayButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <ReloadButtonHelpTopicView />
          <ScheduleImportHelpTopicView />
          <ScheduleSettingsHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
