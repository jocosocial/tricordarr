import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useAppTheme} from '../../../styles/Theme';
import {ScheduleItemCardBase} from '../../Cards/Schedule/ScheduleItemCardBase';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

export const EventHelpScreen = () => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Always confirm event times and locations as they are subject to change.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Event Types
          </Text>
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
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Filtering
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            You can filter events by using the filter menu icon <AppIcon icon={AppIcons.filter} /> at the top of the
            screen.
          </Text>
          <Text>
            If the icon is in blue <AppIcon color={theme.colors.twitarrNeutralButton} icon={AppIcons.filter} /> a filter
            is applied. Long-press to clear any applied filters, or press once to open the menu and select/deselect the
            filter you wish to apply.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            NowTM
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            You can press the <AppIcon icon={AppIcons.events} /> icon at the top of the screen to jump the view to
            today. Pressing again will scroll down to "now".
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Favorite/Follow
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Favoriting an event adds it to a list of all of your favorites. Long press an event in the schedule or press
            the <AppIcon icon={AppIcons.favorite} /> icon at the top of the event details screen. You can see all of
            your favorite events with a filter or with the floating action button.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            LFG Integration
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            There are optional settings to enable showing LFGs you've joined or that are open to you in the schedule.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Your Day Today
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>The Your Day Today screen shows all of your favorite events and joined LFGs for the current day.</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
