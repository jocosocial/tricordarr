import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OfficialPerformersHelpTopicView} from '#src/Components/Views/Help/Common/OfficialPerformersHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const EventOfficialHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Official Events are produced by the JoCo Cruise management and/or featured guests. These appear on the
          schedule posted online and throughout the ship.
        </HelpTopicView>
        <OfficialPerformersHelpTopicView />
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView title={'Favorite/Follow'} icon={AppIcons.favorite}>
          Favoriting an event adds it to a list of all of your favorites. You can see all of your favorite events with a
          filter. You will receive a push notification reminder before any favorite event starts.
        </HelpTopicView>
        <HelpTopicView title={'Forum'} icon={AppIcons.forum}>
          Open the forum thread for this event to discuss it with other attendees. This option only appears if the event
          has a forum.
        </HelpTopicView>
        <HelpTopicView title={'Overlapping'} icon={AppIcons.calendarMultiple}>
          View events, LFGs, and personal events that occur at the same time as this event. Use the "Only your events"
          filter to restrict the list to events you're participating in, events you own, or events you've favorited. You
          can configure a setting to exclude long events (by default, events 4 hours or longer) from the overlap list.
        </HelpTopicView>
        <HelpTopicView title={'Photostream'} icon={AppIcons.photostream}>
          View photos associated with this event. This option only appears if the photostream feature is enabled.
        </HelpTopicView>
        <ShareButtonHelpTopicView />
        <HelpTopicView title={'Download'} icon={AppIcons.download}>
          Download this event as an ICS calendar file that you can import into your calendar app.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
