import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {HelpHeaderText} from '../../Text/Help/HelpHeaderText.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';
import {HelpSectionView} from '../../Views/Help/HelpSectionView.tsx';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {HelpSectionContentView} from '../../Views/Help/HelpSectionContentView.tsx';

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
          <HelpParagraphText>You can favorite or mute a thread by swiping left or right on it.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Posts</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>Long-press a post to favorite, edit, or add a reaction.</HelpParagraphText>
          <HelpParagraphText>
            Tapping on a post will take you to the posts forum to see it in context.
          </HelpParagraphText>
          <HelpParagraphText>
            Favoriting a post will save it to an easily accessible Personal Category on the Forums page.
          </HelpParagraphText>
          <HelpParagraphText>You can edit or delete your own forum posts.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Alert Keywords</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpSectionView>
            <IconButton icon={AppIcons.alertword} />
            <HelpSectionContentView>
              <HelpParagraphText>
                Generate an alert/notification whenever new content is made containing these keywords. Alert words will
                be highlighted in content views like 🚨this🚨.
              </HelpParagraphText>
            </HelpSectionContentView>
          </HelpSectionView>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
