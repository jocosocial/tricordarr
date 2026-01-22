import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {BlockedUsersHelpTopicView} from '#src/Components/Views/Help/Common/BlockedUsersHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ModerateHelpTopicView} from '#src/Components/Views/Help/Common/ModerateHelpTopicView';
import {MutedUsersHelpTopicView} from '#src/Components/Views/Help/Common/MutedUsersHelpTopicView';
import {ReportHelpTopicView} from '#src/Components/Views/Help/Common/ReportHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';

export const UserProfileHelpScreen = () => {
  const {hasAnyPrivilege} = usePrivilege();
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Share as much or as little information about yourself as you'd like with your fellow passengers. All fields
            are optional and free-form (except dinner team which while optional presents a choice).
          </HelpTopicView>
          <HelpTopicView>
            When viewing a users profile, you can long-press any text to either select it or copy it immediately to your
            clipboard. Tapping on the Email field (if present) will open your devices default Mail application.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Edit'} icon={AppIcons.edituser}>
            Tap here to edit your profile information. Only available when viewing your own profile.
          </HelpTopicView>
          <HelpTopicView title={'Seamail'} icon={AppIcons.seamailCreate}>
            Create a new Seamail conversation with that user. Only available when viewing another user's profile.
          </HelpTopicView>
          <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
            Add or remove the user from your favorites list. Favoriting a user allows them to call you with
            KrakenTalk™. Only available when viewing another user's profile.
          </HelpTopicView>
          <HelpTopicView title={'Private Note'} icon={AppIcons.privateNoteEdit}>
            You can save a note about a user that is visible only to you. For example: "Met at the Lido Bar on Monday,
            interested in my D&D campaign". You can also tap the Private Note card to edit it, or long-press to copy the
            note text to your clipboard.
          </HelpTopicView>
          <ShareButtonHelpTopicView />
          <BlockedUsersHelpTopicView forListScreen={false} />
          <MutedUsersHelpTopicView forListScreen={false} />
          <ReportHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        {hasAnyPrivilege && (
          <HelpChapterTitleView title={'Privileged Actions'}>
            <ModerateHelpTopicView />
            <HelpTopicView title={'Registration'} icon={AppIcons.twitarteam}>
              View the user's registration information. This option is only available to users with TwitarrTeam
              privileges.
            </HelpTopicView>
          </HelpChapterTitleView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
