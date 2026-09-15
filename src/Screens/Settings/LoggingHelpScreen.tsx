import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const LoggingHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'Log Settings'}>
          <HelpTopicView title={'Log Level'}>Sets the minimum severity written to the log file.</HelpTopicView>
          <HelpTopicView title={'Download Logs'} icon={AppIcons.download}>
            Exports the current log file.
          </HelpTopicView>
          <HelpTopicView title={'Clear All Logs'} icon={AppIcons.delete}>
            Deletes all stored log files.
          </HelpTopicView>
          <HelpTopicView title={'Retention'}>Log files are kept for 7 days, then deleted automatically.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Log Viewer'}>
          <HelpTopicView title={'Search'} icon={AppIcons.search}>
            Filters entries by message or tag. Press the search icon or submit to apply.
          </HelpTopicView>
          <HelpTopicView title={'Filter'} icon={AppIcons.filter}>
            Narrow the list by level or time range. Long press to clear.
          </HelpTopicView>
          <HelpTopicView title={'Save'} icon={AppIcons.download}>
            Saves or shares the currently visible (filtered) entries.
          </HelpTopicView>
          <HelpTopicView title={'Long Press an Entry'}>Share or copy that single log line.</HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
