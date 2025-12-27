import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const TimeZoneHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={false} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          JoCo Cruise occasionally makes time zone changes during the week. Be careful when scheduling events that you
          take note of the expected time zone.
        </HelpTopicView>
        <HelpTopicView title={'Boat Time'}>
          This should match clocks on the boat. But the Captain sets boat time, so if they don't match, boat clocks are
          right and Twitarr is wrong.
        </HelpTopicView>
        <HelpTopicView title={'Device Time'}>
          Device time is the current time on the device you're holding in your hand.
        </HelpTopicView>
        <HelpChapterTitleView title={'Troubleshooting'} />
        <HelpTopicView>
          If the Boat Time and Device Time are different, you should change the time zone on your device until they
          match. This should be in your settings somewhere. If you can't find it, ask a tech nerd. There's probably one
          nearby.
        </HelpTopicView>
        <HelpTopicView>
          If you changed your device time zone you may need to kill and restart the app to see the changes.
        </HelpTopicView>
        <HelpTopicView>In a pinch you can manually specify a time offset in the app settings.</HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
