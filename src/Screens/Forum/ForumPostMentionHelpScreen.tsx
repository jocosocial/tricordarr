import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ForumPostMentionHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Posts Mentioning You lists forum posts that @mention your username. Tap a post to open it in its thread.
            Long-press a post for the same actions available in a thread.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView>
            Moderators and TwitarrTeam can switch whose mentions they are viewing. The switcher appears at the top of
            the list when you have those privileges. Opening a mention in its thread keeps the same posting identity.
          </HelpTopicView>
          <HelpTopicView title={'Moderator'} icon={AppIcons.moderator}>
            View posts that @mention moderator. Available at Moderator access and above.
          </HelpTopicView>
          <HelpTopicView title={'TwitarrTeam'} icon={AppIcons.twitarrteam}>
            View posts that @mention TwitarrTeam. Available at TwitarrTeam access and above.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
