import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PreRegistrationHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Pre-Registration Mode'} />
        <HelpTopicView>
          Only limited user features are available in pre-registration mode. This is because there is no land-based
          moderation team. And the TwitarrTeam needs to finish packing.
        </HelpTopicView>
        <HelpChapterTitleView title={'Available Actions (Optional)'} />
        <HelpTopicView icon={AppIcons.profile}>
          Fill out a user profile that will be visible to other Twitarr users. This is where you can upload a photo of
          yourself or set preferred pronouns.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.events}>
          Follow official and shadow events in the schedule. This will add them to your in-app day planner and generate
          reminder notifications. You can also import favorites from a Sched.com account if you've done this over there
          already.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.performer}>
          If you are hosting a Shadow Cruise event you can optionally create a performer profile for yourself. This will
          be visible to other Twitarr users and will be attached to the event you're hosting. This is separate from your
          Twitarr user profile.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
