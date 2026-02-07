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
          Karaoke shows recent performances and lets you search the song library and manage favorites. The main screen
          lists the latest performed songs; you can open Favorites or search the library from the header and FAB.
        </HelpTopicView>
        <HelpChapterTitleView title={'Floating Action Button'} />
        <HelpFABView icon={AppIcons.search} label={'Search Library'} />
        <HelpTopicView>Press "Search Library" to open the search screen.</HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView icon={AppIcons.favorite} title={'Favorites'}>
          Use the "Favorites" button in the header to view your favorited karaoke songs.
        </HelpTopicView>
        <HelpTopicView>
          On Recent Performances, Search, and Favorites you can favorite songs (star icon when favorite state is shown)
          and, if you have the karaoke manager role, swipe to reveal "Log" to record a performance.
        </HelpTopicView>
        <HelpChapterTitleView title={'Privileged Actions'} />
        <HelpTopicView icon={AppIcons.karaokeLog} title={'Log Performance'}>
          Karaoke managers can log a performance from any list (Recent Performances, Search, or Favorites) by swiping a
          song and tapping "Log", then entering the performers and saving. This is a privileged action.
        </HelpTopicView>
        <HelpTopicView title={'Search History'}>
          Karaoke managers can turn on "Search History" in the actions menu on the main screen to filter the recent
          performances list by a search query.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
