import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PersonalEventHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Personal/Private Events are private calendar entries created by you within the Twitarr system for you and your
          friends. Useful for a single-app schedule for your day.
        </HelpTopicView>
        <HelpTopicView>
          You can add guests to your personal events. This will automatically create a Seamail chat for it. You can add or
          remove users later on. If you have already created your personal event you cannot add users later. You'll need to
          create a new personal event and add them at the time of creation.
        </HelpTopicView>
        <HelpTopicView>
          For more information about creating personal events, see the Create Personal Event Help screen (available in the
          app drawer).
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView title={'Overlapping'} icon={AppIcons.calendarMultiple}>
          View events, LFGs, and personal events that occur at the same time as this personal event. Use the "Only your
          events" filter to restrict the list to events you're participating in, events you own, or events you've
          favorited. You can configure a setting to exclude long events (by default, events 4 hours or longer) from the
          overlap list.
        </HelpTopicView>
        <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
          Edit the details of this personal event. This option only appears if you are the owner of the event.
        </HelpTopicView>
        <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
          Delete this personal event. This option only appears if you are the owner of the event and it is a personal event
          (not a private event).
        </HelpTopicView>
        <HelpTopicView title={'Cancel'} icon={AppIcons.cancel}>
          Cancel this private event. This option only appears if you are the owner of the event and it is a private event
          (not a personal event).
        </HelpTopicView>
        <HelpTopicView title={'Report'} icon={AppIcons.report}>
          Report this personal event to the moderation team if it violates the Code of Conduct.
        </HelpTopicView>
        <HelpTopicView title={'Chat'} icon={AppIcons.chat}>
          Open the Seamail chat for this private event. This option only appears for private events where you are a
          participant, and appears in the header rather than the actions menu.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
