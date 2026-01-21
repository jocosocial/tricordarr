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

export const SeamailCreateHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Create a new seamail conversation. Fill in the subject, add participants, and choose whether the
            conversation should be open or closed. Then compose your initial message and submit to create the
            conversation.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Form Fields'}>
          <HelpTopicView title={'Participants'}>
            Add users to the seamail conversation. You can add multiple participants. Tap on a participant chip to
            remove them.
          </HelpTopicView>
          <HelpTopicView title={'Subject'}>
            The subject line for your seamail conversation. This is required and helps identify the conversation in your
            seamail list.
          </HelpTopicView>
          <HelpTopicView title={'Open Chat'}>
            Toggle whether the conversation should be open or closed. Open conversations allow you to add or remove
            users later. Closed conversations cannot have participants added or removed after creation. The type cannot
            be changed once the conversation is created.
          </HelpTopicView>
          <PostAsModeratorHelpTopicView />
          <PostAsTwitarrTeamHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Post'}>
          <InsertButtonHelpTopicView enablePhotos={false} />
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
