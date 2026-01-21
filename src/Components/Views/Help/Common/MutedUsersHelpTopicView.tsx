import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const MutedUsersHelpTopicView = () => {
  return (
    <HelpTopicView title={'Muted Users'} icon={AppIcons.mute}>
      View and manage your list of muted users. Muting a user will hide all that user's content from you.
    </HelpTopicView>
  );
};
