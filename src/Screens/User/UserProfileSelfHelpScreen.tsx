import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const UserProfileSelfHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Share as much or as little information about yourself as you would like with your fellow passengers.
          </HelpTopicView>
          <HelpTopicView>
            All profile fields are optional and free-form, except dinner team, which is still optional but uses a preset
            choice.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.edituser} label={'Edit Profile'} />
          <HelpTopicView>Edit your user profile information or add a profile picture.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <ShareButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
