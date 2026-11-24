import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OverlappingHelpTopicView} from '#src/Components/Views/Help/Common/OverlappingHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const LfgListHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            The LFG list screen shows all LFG events. You can browse, search, and filter LFGs to find activities to join
            or manage the ones you've created.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'New LFG'} />
          <HelpTopicView title={'New LFG'} icon={AppIcons.new}>
            Press this to create a new LFG event.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Search for LFGs by title or description. Searches whichever list (All, Joined, Owned) you're currently
            viewing.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            By default the list shows every LFG: ones you can join along with ones you have already joined or created,
            sorted by start time. The filter menu narrows it. Everything in it is combined, so you can mix them.
          </HelpTopicView>
          <HelpTopicView title={'Joined'} icon={AppIcons.lfgJoined}>
            Only LFGs that you have joined. This also includes any LFGs that you created. These are sorted by last
            modification time. Select it again to return to all LFGs.
          </HelpTopicView>
          <HelpTopicView title={'Owned'} icon={AppIcons.lfgOwned}>
            Only LFGs that you have created. These are sorted by creation time. Select it again to return to all LFGs.
          </HelpTopicView>
          <HelpTopicView>
            Favorites, Unread and Cancelled show only LFGs you have joined or created, since open LFGs can't match any
            of them. You can also filter by type (Gaming, Dining, Shore, Activity, Music, Other) or hide past show only
            cancelled LFGs (cancelled LFGs are otherwise included in the list). A filter is active if the menu icon is
            blue and the item in the list is slightly highlighted. Long press the filter button to clear all active
            filters.
          </HelpTopicView>
          <HelpTopicView title={'Former LFGs'} icon={AppIcons.lfgFormer}>
            View LFGs, Private Events, and Seamails that you were previously a member of, but have since left or been
            removed from. You can use this to report any content that you can no longer access. You still will be unable
            to directly view the content.
          </HelpTopicView>
          <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
            Configure your LFG preferences, including whether to hide past LFGs by default.
          </HelpTopicView>
          <OverlappingHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
