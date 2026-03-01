import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const EventLocationHelpChapterView = () => {
  return (
    <HelpChapterTitleView title={'Location'}>
      <HelpTopicView title={'Guidelines'}>
        1. Twitarr is not a reservation system. You can't claim a room or even a table by scheduling your own event
        there.
        {'\n\n'}
        2. Don't set up an event in a room used for Official or Shadow Events.
        {'\n\n'}
        3. Don't try to get around Item 2 by scheduling your event in a room at a time when the Official Schedule
        doesn't list anything happening there. Event rooms are often used for official things even when not running a
        listed event.
        {'\n\n'}
        4. Sometimes places fill up; have backup plans. If you schedule an event at a location onboard and that location
        is unavailable at the appointed time, you can adjust your plans accordingly.
      </HelpTopicView>
      <HelpTopicView title={'Tips & Advice'}>
        The locations in the menu are suggestions. You can type in any location you want (subject to the rules above).
      </HelpTopicView>
    </HelpChapterTitleView>
  );
};
