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
import {ListSection} from '../../Lists/ListSection.tsx';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {AppIcon} from '../../Icons/AppIcon.tsx';

export const ForumHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <ListSection>
          <ListSubheader>Categories</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpParagraphText>
            Forum Categories are broad containers for forum threads. There are two groupings of forum categories: Forum
            (for general topics, announcements, memes, etc) and Personal (for forums that relate specifically to you.)
          </HelpParagraphText>
          <HelpParagraphText>
            You can set up mute words to prevent seeing forum posts containing a specific word.
          </HelpParagraphText>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Threads</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpParagraphText>Muted forums appear at the end of any list of forum threads.</HelpParagraphText>
          <HelpParagraphText>
            Favorited forums appear in the sort order, which by default is Most Recent Post first.
          </HelpParagraphText>
          <HelpParagraphText>Moderators can pin forums to the category.</HelpParagraphText>
          <HelpParagraphText>You can favorite or mute a thread by swiping left or right on it.</HelpParagraphText>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Posts</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpParagraphText>Long-press a post to favorite, edit, or add a reaction.</HelpParagraphText>
          <HelpParagraphText>
            Tapping on a post will take you to the posts forum to see it in context.
          </HelpParagraphText>
          <HelpParagraphText>
            Favoriting a post will save it to an easily accessible Personal Category on the Forums page.
          </HelpParagraphText>
          <HelpParagraphText>You can edit or delete your own forum posts.</HelpParagraphText>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Alert Keywords</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpSectionView>
            <IconButton icon={AppIcons.alertword} />
            <HelpSectionContentView>
              <HelpParagraphText>
                You can set up alert words to ping you when someone makes a forum post containing a specific word.
              </HelpParagraphText>
              <HelpParagraphText>
                Generate an alert/notification whenever new content is made containing these keywords. Alert words will
                be highlighted in content views like 🚨this🚨.
              </HelpParagraphText>
            </HelpSectionContentView>
          </HelpSectionView>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Search</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <HelpSectionView>
            <HelpSectionContentView>
              <HelpParagraphText>
                You can search for either posts or threads by using the Forum Search button under the{' '}
                <AppIcon icon={AppIcons.menu} /> menu. You can limit the scope of search by initiating the search from
                the screen you wish to limit to. For example, searching for posts containing "pokemon" within the
                Activities category can be done from that category's thread list.
              </HelpParagraphText>
            </HelpSectionContentView>
          </HelpSectionView>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
