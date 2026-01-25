import React from 'react';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
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
        <HelpChapterTitleView title={'Event Types'}>
          <HelpTopicView>Tap on a card to learn more about each event type.</HelpTopicView>
          <PaddedContentView>
            <ScheduleItemCardBase
              title={'Official Event'}
              cardStyle={{backgroundColor: theme.colors.twitarrNeutralButton}}
              description={
                'Produced by the JoCo Cruise management and/or featured guests. These appear on the schedule posted online and throughout the ship.'
              }
              onPress={() => commonNavigation.push(CommonStackComponents.eventHelpScreen, {mode: 'official'})}
            />
          </PaddedContentView>
          <PaddedContentView>
            <ScheduleItemCardBase
              title={'Shadow Event'}
              cardStyle={{backgroundColor: theme.colors.jocoPurple}}
              description={
                'Approved by the JoCo Cruise management but conducted by cruise attendees. These appear on the schedule posted online and throughout the ship.'
              }
              onPress={() => commonNavigation.push(CommonStackComponents.eventHelpScreen, {mode: 'shadow'})}
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
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'Schedule Day'}
            description={'View and navigate the schedule for a specific day.'}
            icon={AppIcons.events}
            onPress={() => commonNavigation.push(CommonStackComponents.scheduleDayHelpScreen)}
          />
          <DataFieldListItem
            title={'Day Planner'}
            description={'View your events in a calendar-style timeline view.'}
            icon={AppIcons.dayPlanner}
            onPress={() => commonNavigation.push(CommonStackComponents.scheduleDayPlannerHelpScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
