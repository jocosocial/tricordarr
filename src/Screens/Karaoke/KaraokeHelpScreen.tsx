import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const KaraokeHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Karaoke shows recent performances and lets you search the song library and manage favorites.
        </HelpTopicView>
        <HelpChapterTitleView title={'Floating Action Button'} />
        <HelpFABView icon={AppIcons.search} label={'Search Library'} />
        <HelpTopicView>Search the on-board karaoke song library.</HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView icon={AppIcons.favorite} title={'Favorites'}>
          Add this song to your favorites list.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.search} title={'Search History'}>
          Karaoke managers can turn on "Search History" in the actions menu on the main screen to filter the recent
          performances list by a search query.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
        <HelpChapterTitleView title={'Privileged Actions'} />
        <HelpTopicView icon={AppIcons.karaokeLog} title={'Log Performance'}>
          Karaoke managers can log a performance from any list by swiping a song and tapping "Log". Contact the
          TwitarrTeam or THO to be assigned the Karaoke Manager role.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
