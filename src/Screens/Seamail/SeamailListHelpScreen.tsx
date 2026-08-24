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
            The seamail list screen shows all chats you have joined: Seamail conversations, private event chats, and
            joined LFGs. You can browse, search, and filter your conversations from here. Creating a new Seamail still
            uses the button on this screen. Browse and create LFGs in the LFG tab, and create private events from the
            Schedule.
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
          <HelpTopicView>
            Swipe a conversation left to mute it or mark it as read. This works for Seamail, private event, and LFG
            chats in the list.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Search your joined chats by keyword. This will search the subject line and the content of the messages.
            Search uses the same type filter as the list.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Filter chats by unread messages or by type (Seamail, Private Event, LFG). Nothing is selected by default,
            which shows all joined chats. Unread is separated from the type options in the menu. Selecting a type
            restricts the list to that type; you can select more than one. The filter icon is highlighted when a filter
            is active. Long press the filter button to clear all filters.
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
