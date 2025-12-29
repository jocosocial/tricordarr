import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const SeamailHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Seamail: It's like email, but at sea. Use them to send private messages to other users.
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
        <HelpTopicView>
          You can long-press on a message to access a menu of additional actions such as copy to clipboard.
        </HelpTopicView>
        <HelpChapterTitleView title={'Misc'} />
        <HelpTopicView icon={AppIcons.search}>
          You can search for seamail conversations by keyword. This will search the subject line and the content of the
          messages.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.personalEvent}>
          You can schedule a personal event with the users in a seamail conversation by pressing the "Create Event"
          button in the header.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.details}>
          The details screen for a seamail conversation shows the list of participants and other internal information.
          You can also bulk favorite all users in the chat at once.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
