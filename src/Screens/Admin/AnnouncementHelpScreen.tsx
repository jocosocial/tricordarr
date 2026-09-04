import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for creating and editing system-wide announcements.
 */
export const AnnouncementHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Announcements appear on the Today screen for everyone and generate a push notification. Use sparingly as
            they are noisy and have high visibility impact.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Editorial Guidance'}>
          <HelpTopicView>
            Deleting and creating a new announcement sends a push notification to all mobile users whereas editing an
            existing announcement does not. If you need to make a correction we consider it “a more better experience”
            to edit an existing announcement.
          </HelpTopicView>
          <HelpTopicView>Deleted announcements stay in this list. They are no longer shown to users.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'} />
        <HelpFABView icon={AppIcons.new} label={'New Announcement'} />
        <HelpTopicView>Create a new announcement.</HelpTopicView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
