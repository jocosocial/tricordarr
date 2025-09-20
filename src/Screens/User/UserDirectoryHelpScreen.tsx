import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';

export const UserDirectoryHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Use the directory to find other Twitarr users. Searches by username and Display Name. You must enter at least
          three characters to search.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
