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
          <HelpFABView icon={AppIcons.lfg} label={'Looking For Group'} />
          <HelpTopicView title={'New LFG'} icon={AppIcons.new}>
            Press this to create a new LFG event.
          </HelpTopicView>
          <HelpTopicView title={'Find'} icon={AppIcons.lfgFind}>
            Also referred to as Open. Switch to view LFGs created by others that you can join. This does not include
            LFGs that you created. These are sorted by start time.
          </HelpTopicView>
          <HelpTopicView title={'Joined'} icon={AppIcons.lfgJoined}>
            Switch to view LFGs that you have joined. This also includes any LFGs that you created. These are sorted by
            last modification time.
          </HelpTopicView>
          <HelpTopicView title={'Owned'} icon={AppIcons.lfgOwned}>
            Switch to view LFGs that you have created. These are sorted by creation time.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Search for LFGs by title or description.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Filter LFGs by type (Gaming, Dining, Shore, Activity, Music, Other) or by unread messages. You can also
            toggle to hide past LFGs. A filter is active if the menu icon is blue and the item in the list is slightly
            highlighted. Long press the filter button to clear all active filters.
          </HelpTopicView>
          <HelpTopicView title={'Former LFGs'} icon={AppIcons.lfgFormer}>
            View LFGs, Personal Events, and Seamails that you were previously a member of, but have since left or been
            removed from. You can use this to report any content that you can no longer access. You still will be unable
            to directly view the content.
          </HelpTopicView>
          <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
            Configure your LFG preferences, including the default LFG screen (Find, Joined, Owned) and whether to hide
            past LFGs by default.
          </HelpTopicView>
          <OverlappingHelpTopicView />
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
