import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const FezChatDetailsHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          The details screen shows information about the conversation, including the title, type, total number of posts,
          websocket connection status, and a list of all participants.
        </HelpTopicView>
        <HelpTopicView>
          If you are the ower of an Open seamail conversation you can add or remove participants from this screen.
          Owners of LFGs and Personal Events can do this from the Participation screen.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView title={'Favorite All Users'} icon={AppIcons.favorite}>
          Add all participants in this conversation to your favorites list at once. This makes it easier to find and
          interact with these users later.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
