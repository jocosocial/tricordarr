import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const LfgCreateHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true} isStack={true}>
        <HelpChapterTitleView title={'Location'} />
        <HelpTopicView title={'Guidelines'}>
          1. LFGs are not a reservation system. You can't claim a room or even a table by scheduling an LFG there.
          {'\n\n'}
          2. Don't set up an LFG in a room used for Official or Shadow Events.
          {'\n\n'}
          3. Don't try to get around Item 2 by scheduling your LFG in an Event room at a time when the Official Schedule
          doesn't list anything happening there. Event rooms are often used for official things even when not running a
          listed event.
          {'\n\n'}
          4. Sometimes places fill up; have backup plans. If you schedule a "Drink Like a Pirate" LFG at a bar onboard,
          and that bar's full at the appointed time, you can message the LFG members to relocate.
        </HelpTopicView>
        <HelpTopicView title={'Tips & Advice'}>
          The locations in the menu are suggestions. You can type in any location you want (subject to the rules above).
        </HelpTopicView>
        <HelpChapterTitleView title={'Maximum Attendees Desired'} />
        <HelpTopicView>Use 0 for unlimited</HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
