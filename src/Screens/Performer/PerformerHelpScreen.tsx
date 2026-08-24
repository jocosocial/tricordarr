import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OfficialPerformersHelpTopicView} from '#src/Components/Views/Help/Common/OfficialPerformersHelpTopicView';
import {ShadowPerformerProfilesHelpTopicView} from '#src/Components/Views/Help/Common/ShadowPerformerProfilesHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PerformerHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <OfficialPerformersHelpTopicView />
          <HelpTopicView title={'Shadow Performers'} icon={AppIcons.performer}>
            These are attendees just like you! They have something cool to share and are volunteering their vacation
            time to share it.
          </HelpTopicView>
        </HelpChapterTitleView>
        <ShadowPerformerProfilesHelpTopicView />
        <HelpChapterTitleView title={'Actions'}>
          <ShareButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView title={'View Creator Profile'} icon={AppIcons.moderator}>
            Open the Twitarr user profile of the person who created this performer bio. This is only available for
            Shadow performers and only to moderators.
          </HelpTopicView>
          <HelpTopicView title={'Add Performer'} icon={AppIcons.twitarteam}>
            Add a new performer profile. This should only be used for official cruise guests.
          </HelpTopicView>
          <HelpTopicView title={'Edit Performer'} icon={AppIcons.twitarteam}>
            Edit the performer's profile.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
