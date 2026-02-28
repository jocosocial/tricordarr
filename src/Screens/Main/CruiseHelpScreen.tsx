import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const CruiseHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Conduct Violation'}>
          <HelpTopicView>
            During the cruise, if you are subject to or witness behavior that violates our Code of Conduct, contact any
            Helper or JoCo Cruise staff member. Alternately, you can submit a Code of Conduct Violation Report form at
            the JoCo Cruise Info Desk. (This may be done anonymously if you wish.) You can also dial 74501 from any
            ship's phone. Off-ship, you can email conduct@jococruise.com. JoCo Cruise will make every effort to protect
            the privacy of anyone reporting a violation.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Cruise Assistance'}>
          <HelpTopicView title={'At Sea'}>
            Visit the JoCo Cruise Info Desk, typically located in the atrium on deck 1 midship. Staffed hours for the
            Info Desk are typically found in the daily schedule. You can leave a written message at any time.
          </HelpTopicView>
          <HelpTopicView title={'On Land'}>Contact The Home Office via email at info@jococruise.com.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Twitarr Assistance'}>
          <HelpTopicView>
            There are a few ways to get assistance with Twitarr or its client apps (Tricordarr, Kraken).
          </HelpTopicView>
          <HelpTopicView title={'Forum'} icon={AppIcons.forum}>
            Post in the Help Desk forum category.
          </HelpTopicView>
          <HelpTopicView title={'Seamail'} icon={AppIcons.seamail}>
            Send a Seamail to the @TwitarrTeam user.
          </HelpTopicView>
          <HelpTopicView title={'Office Hours'} icon={AppIcons.events}>
            The TwitarrTeam holds one or two office hour events early on in the cruise. Look at the schedule for when
            and where.
          </HelpTopicView>
          <HelpTopicView title={'JoCo Cruise Info Desk'} icon={AppIcons.info}>
            Visit the JoCo Cruise Info Desk. They can take a message for the TwitarrTeam.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
