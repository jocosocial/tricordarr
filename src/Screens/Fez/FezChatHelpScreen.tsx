import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CopyButtonHelpTopicView} from '#src/Components/Views/Help/Common/CopyButtonHelpTopicView';
import {DetailsButtonHelpTopicView} from '#src/Components/Views/Help/Common/DetailsButtonHelpTopicView';
import {EditButtonHelpTopicView} from '#src/Components/Views/Help/Common/EditButtonHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {MuteButtonHelpTopicView} from '#src/Components/Views/Help/Common/MuteButtonHelpTopicView';
import {PostAsModeratorHelpTopicView} from '#src/Components/Views/Help/Common/PostAsModeratorHelpTopicView';
import {PostAsTwitarrTeamHelpTopicView} from '#src/Components/Views/Help/Common/PostAsTwitarrTeamHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
import {ReportButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReportButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const FezChatHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The chat screen is where you send and receive messages in a seamail conversation. Messages appear in
            chronological order, and you can scroll up to load older messages.
          </HelpTopicView>
          <HelpTopicView>
            You can send text, unicode emojis, and our custom emojis. You cannot send pictures. This is intentional.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Post Actions'}>
          <HelpTopicView>Long-press on a message to access a menu of additional actions.</HelpTopicView>
          <CopyButtonHelpTopicView />
          <ReportButtonHelpTopicView />
          <HelpTopicView>Messages made in Open seamails can be reported to the moderation team.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Create Event'} icon={AppIcons.eventCreate}>
            Schedule a personal event with the users in this seamail conversation. This button only appears for seamail
            conversations that have participants.
          </HelpTopicView>
          <ReloadButtonHelpTopicView />
          <DetailsButtonHelpTopicView />
          <EditButtonHelpTopicView />
          <MuteButtonHelpTopicView />
          <PostAsModeratorHelpTopicView />
          <PostAsTwitarrTeamHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
