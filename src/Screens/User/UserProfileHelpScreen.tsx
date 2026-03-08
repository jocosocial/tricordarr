import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const UserProfileHelpScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            View information about your fellow passengers and learn how profile screens work throughout the app.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'Your Profile'}
            description={'Manage the profile information you share with other passengers.'}
            icon={AppIcons.profile}
            onPress={() => commonNavigation.push(CommonStackComponents.userProfileSelfHelpScreen)}
          />
          <DataFieldListItem
            title={'Other Users'}
            description={'View another passenger profile and interact with them.'}
            icon={AppIcons.user}
            onPress={() => commonNavigation.push(CommonStackComponents.userProfilesHelpScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
