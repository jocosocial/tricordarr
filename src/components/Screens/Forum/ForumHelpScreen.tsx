import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {HelpHeaderText} from '../../Text/Help/HelpHeaderText.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';

export const ForumHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <HelpHeaderText>Categories</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            Forum Categories are broad containers for forum threads. There are two groupings of forum categories: Forum
            (for general topics, announcements, memes, etc) and Personal (for forums that relate specifically to you.)
          </HelpParagraphText>
          <HelpParagraphText>
            You can set up alert words to ping you when someone makes a forum post containing a specific word.
          </HelpParagraphText>
          <HelpParagraphText>
            You can set up mute words to prevent seeing forum posts containing a specific word.
          </HelpParagraphText>
          <HelpParagraphText>
            You can search for forum threads or forum posts using the appropriate action in the floating action button
            at the bottom of the screen.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Threads</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>Muted forums appear at the end of any list of forum threads.</HelpParagraphText>
          <HelpParagraphText>
            Favorited forums appear in the sort order, which by default is Most Recent Post first.
          </HelpParagraphText>
          <HelpParagraphText>Moderators can pin forums to the category.</HelpParagraphText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
