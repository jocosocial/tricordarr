import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {BlockedUsersHelpTopicView} from '#src/Components/Views/Help/Common/BlockedUsersHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ModerateButtonHelpTopicView} from '#src/Components/Views/Help/Common/ModerateButtonHelpTopicView';
import {MutedUsersHelpTopicView} from '#src/Components/Views/Help/Common/MutedUsersHelpTopicView';
import {ReportButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReportButtonHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const UserProfilesHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            View information that another passenger has chosen to share on their profile, including their avatar,
            byline, public profile fields, and profile content.
          </HelpTopicView>
          <HelpTopicView>
            When viewing a user profile, you can long-press text to select it or copy it immediately to your clipboard.
            Tapping on the Email field, if present, opens your devices default Mail application.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.user} label={'User Profile'} />
          <HelpTopicView>Access a menu of options to interact with this user.</HelpTopicView>
          <HelpTopicView title={'Seamail'} icon={AppIcons.seamailCreate}>
            Create a new Seamail conversation with that user.
          </HelpTopicView>
          <HelpTopicView title={'Call'} icon={AppIcons.krakentalkCreate}>
            Start a KrakenTalk call with that user. You can only call users who have favorited you.
          </HelpTopicView>
          <HelpTopicView title={'Private Event'} icon={AppIcons.eventCreate}>
            Create a new private event with this user. The event will be pre-filled with them as an invitee.
          </HelpTopicView>
          <HelpTopicView title={'Private Note'} icon={AppIcons.privateNoteEdit}>
            Save a note about a user that is visible only to you. You can also tap the Private Note card on the profile
            to edit it, or long-press to copy the note text to your clipboard.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
            Add or remove the user from your favorites list. Favoriting a user allows them to call you with KrakenTalk.
          </HelpTopicView>
          <BlockedUsersHelpTopicView forListScreen={false} />
          <MutedUsersHelpTopicView forListScreen={false} />
          <ReportButtonHelpTopicView />
          <ShareButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <ModerateButtonHelpTopicView />
          <HelpTopicView title={'Registration'} icon={AppIcons.twitarteam}>
            View the user registration information. This option is only available to users with TwitarrTeam privileges.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
