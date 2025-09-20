import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';

export const ForumHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Categories'} />
        <HelpTopicView>
          Forum Categories are broad containers for forum threads. There are two groupings of forum categories: Forum
          (for general topics, announcements, memes, etc) and Personal (for forums that relate specifically to you.)
        </HelpTopicView>
        <HelpChapterTitleView title={'Threads'} />
        <HelpTopicView title={'Pin'} icon={AppIcons.pin}>
          Moderators can pin forum threads to the category. This can make them easier to see and should be used
          sparingly.
        </HelpTopicView>
        <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
          Favorited forums appear in the sort order, which by default is Most Recent Post first.
        </HelpTopicView>
        <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
          Muted forums appear at the end of any list of forum threads.
        </HelpTopicView>
        <HelpTopicView>You can favorite or mute a thread by swiping left or right on it.</HelpTopicView>
        <HelpChapterTitleView title={'Posts'} />
        <HelpTopicView title={'Posts'} icon={AppIcons.post}>
          Long-press a post to favorite, edit, or add a reaction. Tapping on a post will take you to the posts forum to
          see it in context. You can edit or delete your own forum posts.
        </HelpTopicView>
        <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
          Favoriting a post will save it to an easily accessible Personal Category on the Forums page.
        </HelpTopicView>
        <HelpChapterTitleView title={'Search'} />
        <HelpTopicView icon={AppIcons.search}>
          You can search for either posts or threads by using the Forum Search button in the header menu. You can limit
          the scope of search by initiating the search from the screen you wish to limit to. For example, searching for
          posts containing "pokemon" within the Activities category can be done from that category's thread list.
        </HelpTopicView>
        <HelpChapterTitleView title={'Keywords'} />
        <HelpTopicView title={'Mute Keywords'} icon={AppIcons.mute}>
          You can set up mute words to prevent seeing forum posts containing a specific word.
        </HelpTopicView>
        <HelpTopicView title={'Alert Keywords'} icon={AppIcons.alertword}>
          You can set up alert words to ping you when someone makes a forum post containing a specific word. Alert words
          will be highlighted in content views like 🚨this🚨.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
