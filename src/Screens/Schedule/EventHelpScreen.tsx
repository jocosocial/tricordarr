import {RouteProp} from '@react-navigation/native';
import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OfficialPerformersHelpTopicView} from '#src/Components/Views/Help/Common/OfficialPerformersHelpTopicView';
import {OverlappingHelpTopicView} from '#src/Components/Views/Help/Common/OverlappingHelpTopicView';
import {ShadowPerformerProfilesHelpTopicView} from '#src/Components/Views/Help/Common/ShadowPerformerProfilesHelpTopicView';
import {ShareButtonHelpTopicView} from '#src/Components/Views/Help/Common/ShareButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';

type EventHelpScreenRouteProp = RouteProp<CommonStackParamList, 'EventHelpScreen'>;

interface EventHelpScreenProps {
  route: EventHelpScreenRouteProp;
}

export const EventHelpScreen = ({route}: EventHelpScreenProps) => {
  const mode = route.params?.mode ?? 'official';
  const isOfficial = mode === 'official';
  const {appConfig} = useConfig();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        {isOfficial ? (
          <HelpTopicView>
            Official Events are produced by the JoCo Cruise management and/or featured guests. These appear on the
            schedule posted online and throughout the ship.
          </HelpTopicView>
        ) : (
          <HelpTopicView>
            Shadow Events are approved by the JoCo Cruise management but conducted by cruise attendees. These appear on
            the schedule posted online and throughout the ship.
          </HelpTopicView>
        )}
        {isOfficial ? <OfficialPerformersHelpTopicView /> : <ShadowPerformerProfilesHelpTopicView />}
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView title={'Favorite/Follow'} icon={AppIcons.favorite}>
          Favoriting an event adds it to a list of all of your favorites. You can see all of your favorite events with a
          filter. You will receive a push notification reminder before any favorite event starts.
        </HelpTopicView>
        <HelpTopicView title={'Forum'} icon={AppIcons.forum}>
          Open the forum thread for this event to discuss it with other attendees. This option only appears if the event
          has a forum.
        </HelpTopicView>
        <OverlappingHelpTopicView />
        {appConfig.enableExperiments && (
          <HelpTopicView title={'Photostream'} icon={AppIcons.photostream}>
            View photos from the Photostream associated with this event.
          </HelpTopicView>
        )}
        <ShareButtonHelpTopicView />
        <HelpTopicView title={'Download'} icon={AppIcons.download}>
          Download this event as an ICS calendar file that you can import into your calendar app.
        </HelpTopicView>
        {!isOfficial && (
          <HelpTopicView title={'Set Organizer'} icon={AppIcons.performer}>
            Create or edit a performer profile for yourself as the organizer of this Shadow Event. This can only be done
            before sailing (or contact the TwitarrTeam for assistance while on board). All profile content is subject to
            moderator review.
          </HelpTopicView>
        )}
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
