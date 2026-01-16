import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const PersonalEventCreateHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true} isStack={true}>
        <HelpChapterTitleView title={'Location'} />
        <HelpTopicView title={'Guidelines'}>
          1. Personal events are not a reservation system. You can't claim a room or even a table by scheduling a
          personal event there.
          {'\n\n'}
          2. Don't set up a personal event in a room used for Official or Shadow Events.
          {'\n\n'}
          3. Don't try to get around Item 2 by scheduling your personal event in an Event room at a time when the
          Official Schedule doesn't list anything happening there. Event rooms are often used for official things even
          when not running a listed event.
          {'\n\n'}
          4. Sometimes places fill up; have backup plans. If you schedule a personal event at a location onboard and
          that location is unavailable at the appointed time, you can adjust your plans accordingly.
        </HelpTopicView>
        <HelpTopicView title={'Tips & Advice'}>
          The locations in the menu are suggestions. You can type in any location you want (subject to the rules above).
          Personal events work like calendar items in your phone - they help you keep track of where you plan to be and
          when, but they don't reserve spaces or coordinate with others.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
