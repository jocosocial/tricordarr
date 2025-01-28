import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';

export const SeamailHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Seamail: It's like email, but at sea. Use them to send private messages to other users.
        </HelpTopicView>
        <HelpTopicView>
          You can swipe a Seamail conversation to archive it. This does nothing other than make your list empty. Any
          posts to the conversation will automatically un-archive it.
        </HelpTopicView>
        <HelpChapterTitleView title={'Types'} />
        <HelpTopicView title={'Open'}>
          Allows you add or remove users later on. Added users will be able to read all past history. This is the
          default type.
        </HelpTopicView>
        <HelpTopicView title={'Closed'}>
          Cannot add or remove users later on. To start chatting with new users you'll need to create a new
          conversation.
        </HelpTopicView>
        <HelpTopicView>The type cannot be changed once the conversation is created.</HelpTopicView>
        <HelpChapterTitleView title={'Content'} />
        <HelpTopicView>
          You can send text, unicode emojis, and our custom emojis. You cannot send pictures. This is intentional.
        </HelpTopicView>
        <HelpTopicView>
          Messages made in Open seamails can be reported to the moderation team by long-pressing on the message and
          selecting Report.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
