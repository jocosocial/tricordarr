import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {SelectionHelpTopicView} from '#src/Components/Views/Help/Common/SelectionHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const SeamailListHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The seamail list screen shows all your seamail conversations. You can browse, search, and filter your
            conversations from here.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'Create Seamail'} />
          <HelpTopicView>
            Press the "Create Seamail" button in the lower right to create a new seamail conversation.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'List Item Actions'}>
          <SelectionHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Filter Unread'} icon={AppIcons.seamailUnread}>
            Toggle to show only unread seamail conversations. Press the button again to show all conversations.
          </HelpTopicView>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Search for seamail conversations by keyword. This will search the subject line and the content of the
            messages.
          </HelpTopicView>
          <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
            Access seamail settings to configure notification preferences and other options.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
