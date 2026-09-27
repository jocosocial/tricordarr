import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for NotificationLogScreen. Split out from LoggingHelpScreen into its own Common Stack
 * screen since NotificationLogScreen itself now lives in the Common Stack (reachable from
 * Settings or the notification bell menu on any tab) rather than only from Settings.
 */
export const NotificationLogHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            View a record of every event this device received on the notification socket from the Twitarr server,
            including ones that did not produce a push notification because a category was disabled or notifications
            were muted.
          </HelpTopicView>
          <HelpTopicView>
            Entries are kept for 7 days or the most recent 1000 events, whichever comes first.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Filters entries by their info text, type, or content ID. Press the search icon or submit to apply.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Narrow the list by notification type or time range. Tap a selected option again, or long press the icon, to
            clear it.
          </HelpTopicView>
          <HelpTopicView title={'Save'} icon={AppIcons.save}>
            Saves or shares the currently visible (filtered) entries.
          </HelpTopicView>
          <HelpTopicView title={'Clear'} icon={AppIcons.delete}>
            Deletes the entire notification log.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
