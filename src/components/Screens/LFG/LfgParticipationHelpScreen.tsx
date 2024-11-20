import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React from 'react';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';

export const LfgParticipationHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true}>
        <PaddedContentView>
          <HelpParagraphText>Don't just add random people to your LFG. It's not nice.</HelpParagraphText>
          <HelpParagraphText>
            If you add people to your LFG, those people should already expect to be added.
          </HelpParagraphText>
          <HelpParagraphText>
            Same idea with removing people: those removed should know why. Don't remove people who signed up just to
            bump your friend off the waitlist.
          </HelpParagraphText>
          <HelpParagraphText>
            If you schedule a "Drink Like a Pirate" LFG and someone joins and asks if they can come as a ninja instead,
            you may tell them it's more of a pirate thing and you may need to remove them to make room for more pirate
            participants.
          </HelpParagraphText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
