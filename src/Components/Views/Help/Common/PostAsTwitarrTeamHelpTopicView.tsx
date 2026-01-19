import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PostAsTwitarrTeamHelpTopicView = () => {
  return (
    <HelpTopicView title={'Post as TwitarrTeam'} icon={AppIcons.twitarteam}>
      Toggle posting as TwitarrTeam. This option is only available if you have TwitarrTeam privileges.
    </HelpTopicView>
  );
};
