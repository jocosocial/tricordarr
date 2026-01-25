import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {EmojiPickerHelpTopicView} from '#src/Components/Views/Help/Common/EmojiPickerHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {InsertButtonHelpTopicView} from '#src/Components/Views/Help/Common/InsertButtonHelpTopicView';
import {PostAsModeratorHelpTopicView} from '#src/Components/Views/Help/Common/PostAsModeratorHelpTopicView';
import {PostAsTwitarrTeamHelpTopicView} from '#src/Components/Views/Help/Common/PostAsTwitarrTeamHelpTopicView';
import {SubmitButtonHelpTopicView} from '#src/Components/Views/Help/Common/SubmitButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ForumThreadCreateHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Create a new forum thread in the selected category. Enter a title for the thread and compose your initial
            post. Once submitted, you will be taken to the new thread.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Form Fields'}>
          <HelpTopicView title={'Title'}>
            The title for your new forum thread. This is required and should be descriptive of the topic you want to
            discuss.
          </HelpTopicView>
          <PostAsModeratorHelpTopicView />
          <PostAsTwitarrTeamHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'First Post'}>
          <InsertButtonHelpTopicView enablePhotos={true} />
          <EmojiPickerHelpTopicView />
          <SubmitButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
