import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {DetailsButtonHelpTopicView} from '#src/Components/Views/Help/Common/DetailsButtonHelpTopicView';
import {EditButtonHelpTopicView} from '#src/Components/Views/Help/Common/EditButtonHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {MuteButtonHelpTopicView} from '#src/Components/Views/Help/Common/MuteButtonHelpTopicView';
import {PostAsModeratorHelpTopicView} from '#src/Components/Views/Help/Common/PostAsModeratorHelpTopicView';
import {PostAsTwitarrTeamHelpTopicView} from '#src/Components/Views/Help/Common/PostAsTwitarrTeamHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
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
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Content'}>
          <HelpTopicView>
            You can send text, unicode emojis, and our custom emojis. You cannot send pictures. This is intentional.
          </HelpTopicView>
          <HelpTopicView>
            Messages made in Open seamails can be reported to the moderation team by long-pressing on the message and
            selecting Report.
          </HelpTopicView>
          <HelpTopicView>
            You can long-press on a message to access a menu of additional actions such as copy to clipboard.
          </HelpTopicView>
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
