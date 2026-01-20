import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {ShadowPerformerProfilesHelpTopicView} from '#src/Components/Views/Help/Common/ShadowPerformerProfilesHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const EventShadowHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Shadow Events are approved by the JoCo Cruise management but conducted by cruise attendees. These appear on
          the schedule posted online and throughout the ship.
        </HelpTopicView>
        <HelpTopicView title={'Shadow Performers'}>
          These are attendees just like you! They have something cool to share and are volunteering their vacation time
          to share it.
        </HelpTopicView>
        <ShadowPerformerProfilesHelpTopicView />
        <HelpChapterTitleView title={'Features'} />
        <HelpTopicView title={'Favorite/Follow'} icon={AppIcons.favorite}>
          Favoriting an event adds it to a list of all of your favorites. Press the favorite icon at the top of the
          event details screen. You can see all of your favorite events with a filter or with the floating action
          button. You will receive a push notification before any favorite event starts.
        </HelpTopicView>
        <HelpTopicView title={'Forums'} icon={AppIcons.forum}>
          All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button
          in the actions menu.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
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
        <HelpTopicView title={'Set Organizer'} icon={AppIcons.performer}>
          Create or edit a performer profile for yourself as the organizer of this Shadow Event. This can only be done
          before sailing (or contact the TwitarrTeam for assistance while on board). All profile content is subject to
          moderator review.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
