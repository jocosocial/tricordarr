import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useAppTheme} from '../../../styles/Theme.ts';
import {ScheduleItemCardBase} from '../../Cards/Schedule/ScheduleItemCardBase.tsx';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';
import {HelpHeaderText} from '../../Text/Help/HelpHeaderText.tsx';

export const ScheduleHelpScreen = () => {
  const theme = useAppTheme();
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <HelpParagraphText>Always confirm event times and locations as they are subject to change.</HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Event Types</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Official Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrNeutralButton}}
            description={
              'Produced by the JoCo Cruise management and/or featured guests. These appear on the schedule posted online and throughout the ship.'
            }
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Shadow Event'}
            cardStyle={{backgroundColor: theme.colors.jocoPurple}}
            description={
              'Approved by the JoCo Cruise management but conducted by cruise attendees. These appear on the schedule posted online and throughout the ship.'
            }
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Looking For Group Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrGrey}}
            description={
              'Attendee organized event. These are available within Twitarr only. Sometimes participation is limited.'
            }
          />
        </PaddedContentView>
        <PaddedContentView>
          <ScheduleItemCardBase
            title={'Personal Event'}
            cardStyle={{backgroundColor: theme.colors.twitarrOrange}}
            description={
              'Private calendar entries created by you within the Twitarr system for you and your friends. Useful for a single-app schedule for your day.'
            }
          />
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Filtering</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            You can filter events by using the filter menu icon <AppIcon icon={AppIcons.filter} /> at the top of the
            screen.
          </HelpParagraphText>
          <HelpParagraphText>
            If the icon is in blue <AppIcon color={theme.colors.twitarrNeutralButton} icon={AppIcons.filter} /> a filter
            is applied. Long-press to clear any applied filters, or press once to open the menu and select/deselect the
            filter you wish to apply.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>NowTM</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            You can press the <AppIcon icon={AppIcons.events} /> icon at the top of the screen to jump the view to
            today. Pressing again will scroll down to "now".
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Favorite/Follow</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            Favoriting an event adds it to a list of all of your favorites. Long press an event in the schedule or press
            the <AppIcon icon={AppIcons.favorite} /> icon at the top of the event details screen. You can see all of
            your favorite events with a filter or with the floating action button.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Forums</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            All events are given a corresponding forum. You can use that to discuss the event by tapping the forum
            button in the Menu.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>LFG Integration</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            There are optional settings to enable showing LFGs you've joined or that are open to you in the schedule.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Your Day Today</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            Press the <AppIcon icon={AppIcons.personalEvent} /> button on the schedule screen to view all of your events
            for the day. This includes favorited events, personal events, and joined LFGs. Pressing the button again
            will disengage the filters.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Shadow Performer Profiles</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            If you are a Shadow Cruise event organizer you can optionally create a performer bio for yourself that is
            attached to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The
            intent of this feature is to let people thinking of attending your session know a bit about you.
          </HelpParagraphText>
          <HelpParagraphText>
            Performer Profiles for Shadow Cruise organizers can only be created before sailing. Long press the event in
            the Schedule screen and select Set Organizer to fill out the form. If you wish to create one while on board
            contact the TwitarrTeam for assistance. All profile content is subject to moderator review.
          </HelpParagraphText>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
