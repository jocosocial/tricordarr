import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const SeamailHelpScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Seamail: It's like email, but at sea. Use them to send private messages to other users.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'List (Default)'}
            description={'Browse and manage your seamail conversations.'}
            icon={AppIcons.seamail}
            onPress={() => commonNavigation.push(CommonStackComponents.seamailListHelpScreen)}
          />
          <DataFieldListItem
            title={'Create'}
            description={'Create a new seamail conversation.'}
            icon={AppIcons.new}
            onPress={() => commonNavigation.push(CommonStackComponents.seamailCreateHelpScreen)}
          />
          <DataFieldListItem
            title={'Search'}
            description={'Search your seamail conversations by keyword.'}
            icon={AppIcons.search}
            onPress={() => commonNavigation.push(CommonStackComponents.seamailSearchHelpScreen)}
          />
          <DataFieldListItem
            title={'Chat'}
            description={'Send messages and interact in conversations.'}
            icon={AppIcons.chat}
            onPress={() => commonNavigation.push(CommonStackComponents.fezChatHelpScreen)}
          />
          <DataFieldListItem
            title={'Chat Details'}
            description={'View participants and conversation information.'}
            icon={AppIcons.details}
            onPress={() => commonNavigation.push(CommonStackComponents.fezChatDetailsHelpScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
