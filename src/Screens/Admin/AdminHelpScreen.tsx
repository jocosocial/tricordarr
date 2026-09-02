import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

export const AdminHelpScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Server Admin is generally for TwitarrTeam and above. Certain roles have limited access to certain screens in
            this area.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'Announcements'}
            description={'Create, edit, and delete system-wide announcements.'}
            icon={AppIcons.announcement}
            onPress={() => commonNavigation.push(CommonStackComponents.announcementHelpScreen)}
          />
          <DataFieldListItem
            title={'Event Feedback'}
            description={'Print room signs, review host reports, and download CSV.'}
            icon={AppIcons.feedback}
            onPress={() => commonNavigation.push(CommonStackComponents.eventFeedbackHelpScreen, {mode: 'admin'})}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView title={'THO'} icon={AppIcons.tho}>
            Daily themes, user roles, and promoting Moderators or TwitarrTeam require THO access. Demoting a user
            returns them to Verified.
          </HelpTopicView>
          <HelpTopicView title={'Admin'} icon={AppIcons.admin}>
            Changing server settings, disabling features, bulk user import, promoting to THO, and reloading karaoke,
            board games, or time zone seed data require the admin account. TwitarrTeam can view settings and feature
            flags but cannot save them.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Disabled Features'}>
          <HelpTopicView icon={AppIcons.features}>
            Each feature has a chip per client. A filled chip means that client cannot use the feature. Outlined chips
            are enabled. Disabling a feature for All Clients turns it off at the API, so every app will get errors if it
            still calls those endpoints. Only changed chips are sent to the server.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Schedule Updates'}>
          <HelpTopicView icon={AppIcons.schedImport}>
            Paste an ICS file, upload it, then verify the diff before applying. Process Deletes treats the file as the
            complete schedule. Leave it off if you are applying a partial update. Reload Schedule From URL uses the
            schedule URL in Server Settings.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Puzzle Hunts'}>
          <HelpTopicView icon={AppIcons.hunts}>
            Create a hunt with all of its puzzles at once. After creation you can edit hunt details and individual
            puzzles, but you cannot add new puzzles to an existing hunt.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Bulk User Import'}>
          <HelpTopicView icon={AppIcons.bulkUser}>
            Download a zip of user records or pick a zip to upload. Verify the preview, then apply. Put the server in
            admin-only mode before applying an import.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'TwitarrTeam Inboxes'}>
          <HelpTopicView icon={AppIcons.seamail}>
            TwitarrTeam Seamail opens the Seamail list already switched to the TwitarrTeam account. Back returns to
            Server Admin.
          </HelpTopicView>
          <HelpTopicView icon={AppIcons.forum}>
            TwitarrTeam Forum Mentions opens the native mention list as TwitarrTeam. Back returns to Server Admin. Use
            the account switcher to view your own mentions or Moderator mentions if you have that access.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Web UI'}>
          <HelpTopicView icon={AppIcons.webview}>Performers open the website.</HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
