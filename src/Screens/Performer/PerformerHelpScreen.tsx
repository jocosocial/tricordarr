import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {HelpChapterTitleView} from '#src/Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '#src/Views/Help/HelpTopicView.tsx';

export const PerformerHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView title={'Official Performers'} icon={AppIcons.official}>
          These are guests hired by the Home Office to share or present their talent with JoCo Cruise. You've probably
          heard of some of them. Look for the badge next to their name.
        </HelpTopicView>
        <HelpTopicView>
          Please do your best to “read the room” and use proper judgment as to when introduction/autograph/photo
          requesting is appropriate or encouraged.
        </HelpTopicView>
        <HelpTopicView>
          If a performer or guest does not appear to be preoccupied, it is fine to introduce yourself and say something
          to the effect of “I really appreciate your work.” Then pay attention to what happens next; if the performer
          says “Thank you” and nothing else, that probably means they aren’t in a good place to have a conversation
          right now, and you should probably move on.
        </HelpTopicView>
        <HelpTopicView title={'Shadow Performers'}>
          These are attendees just like you! They have something cool to share and are volunteering their vacation time
          to share it.
        </HelpTopicView>
        <HelpChapterTitleView title={'Shadow Profiles'} />
        <HelpTopicView>
          If you are a Shadow Cruise event organizer you can optionally create a performer bio for yourself that is
          attached to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The intent
          of this feature is to let people thinking of attending your session know a bit about you.
        </HelpTopicView>
        <HelpTopicView>
          Performer Profiles for Shadow Cruise organizers can only be created before sailing. Long press the event in
          the Schedule screen and select Set Organizer to fill out the form. If you wish to create one while on board
          contact the TwitarrTeam for assistance. All profile content is subject to moderator review.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
