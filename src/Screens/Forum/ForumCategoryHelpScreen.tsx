import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {SelectionHelpTopicView} from '#src/Components/Views/Help/Common/SelectionHelpTopicView';
import {ForumSearchPostsHelpTopicView} from '#src/Components/Views/Help/Forum/ForumSearchPostsHelpTopicView';
import {ForumSearchThreadsHelpTopicView} from '#src/Components/Views/Help/Forum/ForumSearchThreadsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ForumCategoryHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The category screen shows all threads in a category. You can browse, sort, filter, and search for threads
            from here.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'New Forum'} />
          <HelpTopicView>
            Press the "New Forum" button in the lower right to create a new forum thread in this category. This button
            may not appear if the category is restricted.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <ForumSearchThreadsHelpTopicView category={true} />
          <ForumSearchPostsHelpTopicView scope={'category'} />
          <HelpTopicView title={'Sort'} icon={AppIcons.sort}>
            Change the sort order of threads. Options include sorting by most recent post, creation date, or title.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Filter threads to show only favorites, owned, muted, or unread threads.
          </HelpTopicView>
          <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
            Access forum settings to configure sorting preferences, alert word highlighting, and push notifications.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
          <HelpChapterTitleView title={'Thread Actions'}>
            <HelpTopicView>
              Each thread in the list can be swiped left or right to perform additional actions for that specific
              thread.
            </HelpTopicView>
            <HelpTopicView title={'Mark as Read'} icon={AppIcons.markAsRead}>
              Marking a thread as read will clear the unread post indicator.
            </HelpTopicView>
            <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
              Favorited forums appear in the Personal Categories section on the main Forums page for easy access.
            </HelpTopicView>
            <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
              Muted forums appear at the end of any list of forum threads.
            </HelpTopicView>
            <HelpTopicView title={'Pin'} icon={AppIcons.pin}>
              Moderators can pin forum threads to the category. Pinned threads appear at the top of the list and should
              be used sparingly.
            </HelpTopicView>
            <SelectionHelpTopicView />
          </HelpChapterTitleView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
