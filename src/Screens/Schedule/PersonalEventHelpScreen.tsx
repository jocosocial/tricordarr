import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {EventLocationHelpChapterView} from '#src/Components/Views/Help/Common/EventLocationHelpChapterView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {OverlappingHelpTopicView} from '#src/Components/Views/Help/Common/OverlappingHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PersonalEventHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Personal/Private Events are private calendar entries created by you within the Twitarr system for you and your
          friends. Useful for a single-app schedule for your day or making reminders for yourself.
        </HelpTopicView>
        <HelpTopicView>
          You can add guests when creating a private event. This automatically creates a Seamail chat. If you create the
          event without guests, you cannot add users later; you'll need to create a new private event and invite them at
          creation. If the event already has guests, you can add or remove users later.
        </HelpTopicView>
        <EventLocationHelpChapterView />
        <HelpChapterTitleView title={'Actions'} />
        <OverlappingHelpTopicView />
        <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
          Edit the details of this private event. This option only appears if you are the owner of the event.
        </HelpTopicView>
        <HelpTopicView title={'Delete'} icon={AppIcons.delete}>
          Delete this private event. This option only appears if you are the owner and the event has no guests.
        </HelpTopicView>
        <HelpTopicView title={'Cancel'} icon={AppIcons.cancel}>
          Cancel this private event. This option only appears if you are the owner and the event has guests.
        </HelpTopicView>
        <HelpTopicView title={'Leave'} icon={AppIcons.leave}>
          Leave this private event. This option only appears if you were invited and are not the owner, and appears on
          the event screen rather than the actions menu. After leaving, you return to the previous screen.
        </HelpTopicView>
        <HelpTopicView title={'Report'} icon={AppIcons.report}>
          Report this private event to the moderation team if it violates the Code of Conduct.
        </HelpTopicView>
        <HelpTopicView title={'Chat'} icon={AppIcons.chat}>
          Open the Seamail chat for this private event. This option only appears for events with guests where you are a
          participant, and appears in the header rather than the actions menu.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
