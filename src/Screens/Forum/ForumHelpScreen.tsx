import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const ForumHelpScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Forums are a place to have discussions with other users. Forums are organized into Categories which contain
            Threads. Each Thread contains Posts from users. Categories can be general topics like announcements, memes,
            or activities, or Personal categories that relate specifically to you like favorites or your own posts.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'Categories (Default)'}
            description={'Browse forum categories and personal forums.'}
            icon={AppIcons.forum}
            onPress={() => commonNavigation.push(CommonStackComponents.forumCategoriesHelpScreen)}
          />
          <DataFieldListItem
            title={'Category'}
            description={'View threads in a category.'}
            icon={AppIcons.forumActive}
            onPress={() => commonNavigation.push(CommonStackComponents.forumCategoryHelpScreen)}
          />
          <DataFieldListItem
            title={'Thread'}
            description={'View and reply to posts in a thread.'}
            icon={AppIcons.post}
            onPress={() => commonNavigation.push(CommonStackComponents.forumThreadHelpScreen)}
          />
          <DataFieldListItem
            title={'Create Thread'}
            description={'Create a new forum thread.'}
            icon={AppIcons.new}
            onPress={() => commonNavigation.push(CommonStackComponents.forumThreadCreateHelpScreen)}
          />
          <DataFieldListItem
            title={'Thread Search'}
            description={'Search for forum threads by keyword.'}
            icon={AppIcons.search}
            onPress={() => commonNavigation.push(CommonStackComponents.forumThreadSearchHelpScreen)}
          />
          <DataFieldListItem
            title={'Post Search'}
            description={'Search for forum posts by keyword.'}
            icon={AppIcons.search}
            onPress={() => commonNavigation.push(CommonStackComponents.forumPostSearchHelpScreen)}
          />
          <DataFieldListItem
            title={'Keywords'}
            description={'Configure alert and mute keywords for notifications and filtering forum content.'}
            icon={AppIcons.alertword}
            onPress={() => commonNavigation.push(CommonStackComponents.keywordsHelpScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
