import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const OfficialPerformersHelpTopicView = () => {
  return (
    <>
      <HelpTopicView title={'Official Performers'} icon={AppIcons.official}>
        These are guests hired by the Home Office to share or present their talent with JoCo Cruise. You've probably heard
        of some of them. Look for the badge next to their name.
      </HelpTopicView>
      <HelpTopicView>
        Please do your best to "read the room" and use proper judgment as to when introduction/autograph/photo requesting is
        appropriate or encouraged.
      </HelpTopicView>
      <HelpTopicView>
        If a performer or guest does not appear to be preoccupied, it is fine to introduce yourself and say something to
        the effect of "I really appreciate your work." Then pay attention to what happens next; if the performer says
        "Thank you" and nothing else, that probably means they aren't in a good place to have a conversation right now,
        and you should probably move on.
      </HelpTopicView>
    </>
  );
};
