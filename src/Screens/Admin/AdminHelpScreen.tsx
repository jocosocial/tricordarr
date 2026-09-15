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
            Server Admin is accessible to TwitarrTeam and above but many bits only available via the Admin user.
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
          <DataFieldListItem
            title={'Registration Codes'}
            description={'Look up codes by user or code, unlock password recovery, and allocate Discord codes.'}
            icon={AppIcons.registrationCode}
            onPress={() => commonNavigation.push(CommonStackComponents.registrationCodeHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
