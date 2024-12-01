import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {HelpHeaderText} from '../../Text/Help/HelpHeaderText.tsx';
import {HelpParagraphText} from '../../Text/Help/HelpParagraphText.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {styleDefaults} from '../../../styles';

export const PerformerHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListTitleView title={'General'} />
        <PaddedContentView padTop={true}>
          <HelpHeaderText>Official Performers</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            These are guests hired by the Home Office to share or present their talent with JoCo Cruise. You've probably
            heard of some of them. Their performer profiles appear with a{' '}
            <AppIcon size={styleDefaults.IconSizeSmall} icon={AppIcons.official} /> mark.
          </HelpParagraphText>
          <HelpParagraphText>
            Please do your best to “read the room” and use proper judgment as to when introduction/autograph/photo
            requesting is appropriate or encouraged.
          </HelpParagraphText>
          <HelpParagraphText>
            If a performer or guest does not appear to be preoccupied, it is fine to introduce yourself and say
            something to the effect of “I really appreciate your work.” Then pay attention to what happens next; if the
            performer says “Thank you” and nothing else, that probably means they aren’t in a good place to have a
            conversation right now, and you should probably move on.
          </HelpParagraphText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Shadow Performers</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <HelpParagraphText>
            These are attendees just like you! They have something cool to share and are volunteering their vacation
            time to share it.
          </HelpParagraphText>
        </PaddedContentView>
        <ListTitleView title={'Shadow Profiles'} />
        <PaddedContentView padTop={true}>
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
