import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OverlappingHelpTopicView} from '#src/Components/Views/Help/Common/OverlappingHelpTopicView';
import {ReloadButtonHelpTopicView} from '#src/Components/Views/Help/Common/ReloadButtonHelpTopicView';
import {ScheduleDayButtonHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleDayButtonHelpTopicView';
import {ScheduleImportHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleImportHelpTopicView';
import {ScheduleSettingsHelpTopicView} from '#src/Components/Views/Help/Common/ScheduleSettingsHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ScheduleDayHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Navigation'}>
          <HelpTopicView title={'Filtering'} icon={AppIcons.filter}>
            You can filter events by using the filter menu icon at the top of the screen.
          </HelpTopicView>
          <HelpTopicView>
            If the icon is in blue a filter is applied. Long-press to clear any applied filters, or press once to open
            the menu and select/deselect the filter you wish to apply.
          </HelpTopicView>
          <ScheduleDayButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <ReloadButtonHelpTopicView />
          <ScheduleImportHelpTopicView />
          <ScheduleSettingsHelpTopicView />
          <HelpButtonHelpTopicView />
          <HelpTopicView title={'Favorite/Follow'} icon={AppIcons.favorite}>
            Favoriting an event adds it to a list of all of your favorites. Long press an event in the schedule or press
            the icon at the top of the event details screen. You can see all of your favorite events with a filter or
            with the floating action button. You will receive a push notification before any favorite event starts.
          </HelpTopicView>
          <HelpTopicView title={'Forums'} icon={AppIcons.forum}>
            All events are given a corresponding forum. You can use that to discuss the event by tapping the forum
            button in the Menu.
          </HelpTopicView>
          <OverlappingHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'LFG Integration'}>
          <HelpTopicView>
            There are optional settings to enable showing LFGs you've joined or that are open to you in the schedule.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
