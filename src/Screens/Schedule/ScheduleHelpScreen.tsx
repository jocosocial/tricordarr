import React from 'react';

import {ScheduleHeaderDayButton} from '#src/Components/Buttons/ScheduleHeaderDayButton';
import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const ScheduleHelpScreen = () => {
  const {theme} = useAppTheme();
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>Always confirm event times and locations as they are subject to change.</HelpTopicView>
        <HelpChapterTitleView title={'Event Types'} />
        <HelpTopicView>Tap on a card to learn more about each event type.</HelpTopicView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Official Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrNeutralButton}}
            description={
              'Produced by the JoCo Cruise management and/or featured guests. These appear on the schedule posted online and throughout the ship.'
            }
            onPress={() => commonNavigation.push(CommonStackComponents.eventOfficialHelpScreen)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Shadow Event'}
            cardStyle={{backgroundColor: theme.colors.jocoPurple}}
            description={
              'Approved by the JoCo Cruise management but conducted by cruise attendees. These appear on the schedule posted online and throughout the ship.'
            }
            onPress={() => commonNavigation.push(CommonStackComponents.eventShadowHelpScreen)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Looking For Group Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrGrey}}
            description={
              'Attendee organized event. These are available within Twitarr only. Sometimes participation is limited.'
            }
            onPress={() => commonNavigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Personal/Private Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrOrange}}
            description={
              'Private calendar entries created by you within the Twitarr system for you and your friends. Useful for a single-app schedule for your day.'
            }
            onPress={() => commonNavigation.push(CommonStackComponents.personalEventHelpScreen)}
          />
        </PaddedContentView>
        <HelpChapterTitleView title={'Navigation'} />
        <HelpTopicView title={'Filtering'} icon={AppIcons.filter}>
          You can filter events by using the filter menu icon at the top of the screen.
        </HelpTopicView>
        <HelpTopicView>
          If the icon is in blue a filter is applied. Long-press to clear any applied filters, or press once to open the
          menu and select/deselect the filter you wish to apply.
        </HelpTopicView>
        <HelpTopicView
          title={'Now™'}
          right={
            <ScheduleHeaderDayButton
              cruiseDay={{
                date: new Date(),
                cruiseDay: 0,
              }}
              onPress={() => {}}
              disabled={true}
            />
          }>
          Pressing on a day button will take you to the schedule for that day. Pressing it again will jump you to around
          the current time.
        </HelpTopicView>
        <HelpTopicView title={'Day Planner'} icon={AppIcons.dayPlanner}>
          Press this button on the bottom-right corner of the schedule screen to view your events in a calendar-style
          view. This includes favorited events, personal events, and joined LFGs. Once you've picked your events, this
          is your main screen for keeping track of your days onboard.
        </HelpTopicView>
        <HelpTopicView title={'Favorite/Follow'} icon={AppIcons.favorite}>
          Favoriting an event adds it to a list of all of your favorites. Long press an event in the schedule or press
          the icon at the top of the event details screen. You can see all of your favorite events with a filter or with
          the floating action button. You will receive a push notification before any favorite event starts.
        </HelpTopicView>
        <HelpTopicView title={'Forums'} icon={AppIcons.forum}>
          All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button
          in the Menu.
        </HelpTopicView>
        <HelpTopicView title={'Overlapping Events'} icon={AppIcons.calendarMultiple}>
          View events, LFGs, and personal events that occur at the same time as a selected event. Tap the "Overlapping"
          button in the actions menu of any event, LFG, or personal event screen, or by long-pressing an event card and
          selecting "Overlapping". Use the "Only your events" filter to restrict the list to events you're participating
          in, events you own, or events you've favorited. You can configure a setting to exclude long events (by
          default, events 4 hours or longer) from the overlap list.
        </HelpTopicView>
        <HelpChapterTitleView title={'LFG Integration'} />
        <HelpTopicView>
          There are optional settings to enable showing LFGs you've joined or that are open to you in the schedule.
        </HelpTopicView>
        <HelpChapterTitleView title={'Shutternauts'} />
        <HelpTopicView>See the Shutternaut Help (available in the app drawer) for more information.</HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
