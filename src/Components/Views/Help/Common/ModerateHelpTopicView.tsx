import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ModerateHelpTopicView = () => {
  return (
    <HelpTopicView title={'Moderate'} icon={AppIcons.moderator}>
      Moderate this content. This option is only available to users with Moderator privileges.
    </HelpTopicView>
  );
};
