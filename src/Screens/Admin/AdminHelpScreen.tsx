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
          <DataFieldListItem
            title={'Registration Codes'}
            description={'Look up codes by user or code, unlock password recovery, and allocate Discord codes.'}
            icon={AppIcons.registrationCode}
            onPress={() => commonNavigation.push(CommonStackComponents.registrationCodeHelpScreen)}
          />
          <DataFieldListItem
            title={'Server Settings'}
            description={'Limits, notifications, Wi-Fi, and related server options.'}
            icon={AppIcons.settings}
            onPress={() => commonNavigation.push(CommonStackComponents.adminServerSettingsHelpScreen)}
          />
          <DataFieldListItem
            title={'Disabled Features'}
            description={'What users see when a feature is administratively disabled.'}
            icon={AppIcons.disabled}
            onPress={() => commonNavigation.push(CommonStackComponents.disabledHelpScreen)}
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
          <HelpTopicView title={'Schedule Manager'} icon={AppIcons.webview}>
            Opens the website to upload an ICS file, verify the diff, and apply it.
          </HelpTopicView>
          <HelpTopicView title={'Performers'} icon={AppIcons.webview}>
            Opens the website to manage performers and link them to their events.
          </HelpTopicView>
          <HelpTopicView title={'Puzzle Hunts'} icon={AppIcons.webview}>
            Opens the website to create and edit puzzle hunts.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
