import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

export const EventHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            Official events (blue) are produced by the JoCo Cruise management or featured guests. Shadow events (purple)
            have been approved by the JoCo Cruise management but are run by attendees. Looking For Group events (grey)
            are organized by the attendee community. You can filter events by using the filter menu at the top of the
            screen. A filter is active if the menu icon is blue and the item in the list is slightly highlighted. Long
            press the menu button to clear all active filters Tap the calendar icon to jump to NowTM in the schedule.
            Long press to access a menu of all cruise days.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
