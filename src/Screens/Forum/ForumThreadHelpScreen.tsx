import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CopyButtonHelpTopicView} from '#src/Components/Views/Help/Common/CopyButtonHelpTopicView';
import {EmojiPickerHelpTopicView} from '#src/Components/Views/Help/Common/EmojiPickerHelpTopicView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {InsertButtonHelpTopicView} from '#src/Components/Views/Help/Common/InsertButtonHelpTopicView';
import {ModerateButtonHelpTopicView} from '#src/Components/Views/Help/Common/ModerateButtonHelpTopicView';
import {PostAsModeratorHelpTopicView} from '#src/Components/Views/Help/Common/PostAsModeratorHelpTopicView';
import {PostAsTwitarrTeamHelpTopicView} from '#src/Components/Views/Help/Common/PostAsTwitarrTeamHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
import {ReportButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReportButtonHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {SubmitButtonHelpTopicView} from '#src/Components/Views/Help/Common/SubmitButtonHelpTopicView';
import {ForumSearchPostsHelpTopicView} from '#src/Components/Views/Help/Forum/ForumSearchPostsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ForumThreadHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The thread screen shows all posts in a forum thread. You can read posts, reply to the thread, and interact
            with individual posts.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Post Actions'}>
          <HelpTopicView>Long-press a post to access a menu of actions for that specific post.</HelpTopicView>
          <CopyButtonHelpTopicView />
          <ShareButtonHelpTopicView />
          <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
            You can edit the contents of youR own forum posts.
          </HelpTopicView>
          <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
            You can delete your own forum posts. Deleted posts cannot be recovered.
          </HelpTopicView>
          <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
            Favoriting a post will save it to the Favorite Posts section in Personal Categories on the Forums page.
          </HelpTopicView>
          <HelpTopicView title={'Pin Post to Thread'} icon={AppIcons.pin}>
            Pin or unpin this post to this thread. Pinned posts are accessed through the Pinned Posts action described
            above.
          </HelpTopicView>
          <HelpTopicView>
            You can also add reactions to this post using one of the three reaction buttons.
          </HelpTopicView>
          <ReportButtonHelpTopicView />
          <ModerateButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Make a Post'}>
          <InsertButtonHelpTopicView enablePhotos={true} />
          <EmojiPickerHelpTopicView />
          <SubmitButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Pinned Posts'} icon={AppIcons.pin}>
            View pinned posts for this thread. These can be set by the creator of the thread or by moderators.
          </HelpTopicView>
          <ForumSearchPostsHelpTopicView scope={'thread'} />
          <ReloadButtonHelpTopicView />
          <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
            Favorite or unfavorite this thread. Favorited threads appear in Personal Categories for easy access.
          </HelpTopicView>
          <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
            Mute or unmute this thread. Muted threads appear at the end of thread lists.
          </HelpTopicView>
          <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
            Edit the thread title. Only available if you created the thread.
          </HelpTopicView>
          <ReportButtonHelpTopicView />
          <ShareButtonHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <PostAsTwitarrTeamHelpTopicView />
          <PostAsModeratorHelpTopicView />
          <ModerateButtonHelpTopicView />
          <HelpTopicView title={'Pin Thread to Category'} icon={AppIcons.pin}>
            Pin or unpin this thread to the top of the category. Pinned threads appear first in thread lists.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
