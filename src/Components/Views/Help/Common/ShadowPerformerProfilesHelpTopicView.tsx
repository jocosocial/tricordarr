import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const ShadowPerformerProfilesHelpTopicView = () => {
  return (
    <>
      <HelpChapterTitleView title={'Shadow Profiles'} />
      <HelpTopicView>
        If you are a Shadow Cruise event organizer you can optionally create a performer bio for yourself that is attached
        to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The intent of this
        feature is to let people thinking of attending your session know a bit about you.
      </HelpTopicView>
      <HelpTopicView>
        Performer Profiles for Shadow Cruise organizers can only be created before sailing. Long press the event in the
        Schedule screen and select Set Organizer to fill out the form. If you wish to create one while on board contact
        the TwitarrTeam for assistance. All profile content is subject to moderator review.
      </HelpTopicView>
    </>
  );
};
