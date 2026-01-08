import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const UserRelationsHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          You can block, mute, or favorite other users. They do not know if you have applied any of these actions to
          them.
        </HelpTopicView>
        <HelpChapterTitleView title={'Relations'} />
        <HelpTopicView title={'Block'} icon={AppIcons.block}>
          Blocking a user will hide all that user's content from you, and also hide all your content from them.
        </HelpTopicView>
        <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
          Muting a user will hide all that user's content from you.
        </HelpTopicView>
        <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
          Favoriting a user allows them to call you with KrakenTalk™.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
