import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PostAsModeratorHelpTopicView = () => {
  return (
    <HelpTopicView title={'Post as Moderator'} icon={AppIcons.moderator}>
      Toggle posting as a moderator. This option is only available if you have moderator privileges.
    </HelpTopicView>
  );
};
