import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ListSection} from '../../Lists/ListSection.tsx';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';
import {HelpHeaderText} from '../../Text/Help/HelpHeaderText.tsx';

export const SeamailHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>General</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpParagraphText>
            Seamail: It's like email, but at sea. Use them to send private messages to other users.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Types of Seamail Conversations</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            Open: Allows you add or remove users later on. Added users will be able to read all past history. This is
            the default type.
          </HelpParagraphText>
          <HelpParagraphText>
            Closed: Cannot add or remove users later on. To start chatting with new users you'll need to create a new
            conversation.
          </HelpParagraphText>
          <HelpParagraphText>The type cannot be changed once the conversation is created.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Seamail Content</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            You can send text, unicode emojis, and our custom emojis. You cannot send pictures. This is intentional.
          </HelpParagraphText>
          <HelpParagraphText>
            Messages made in Open seamails can be reported to the moderation team by long-pressing on the message and
            selecting Report.
          </HelpParagraphText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
