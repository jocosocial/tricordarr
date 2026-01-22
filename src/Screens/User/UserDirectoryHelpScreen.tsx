import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {BlockedUsersHelpTopicView} from '#src/Components/Views/Help/Common/BlockedUsersHelpTopicView';
import {FavoriteUsersHelpTopicView} from '#src/Components/Views/Help/Common/FavoriteUsersHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {MutedUsersHelpTopicView} from '#src/Components/Views/Help/Common/MutedUsersHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const UserDirectoryHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Use the directory to find other Twitarr users. The search bar searches by username and display name. You must
          enter at least two characters to search.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <FavoriteUsersHelpTopicView forListScreen={true} />
        <MutedUsersHelpTopicView forListScreen={true} />
        <BlockedUsersHelpTopicView forListScreen={true} />
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
