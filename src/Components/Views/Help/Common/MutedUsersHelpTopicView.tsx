import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface MutedUsersHelpTopicViewProps {
  forListScreen?: boolean;
}

export const MutedUsersHelpTopicView = ({forListScreen = true}: MutedUsersHelpTopicViewProps = {}) => {
  return (
    <HelpTopicView title={forListScreen ? 'Muted Users' : 'Mute User'} icon={AppIcons.mute}>
      {forListScreen && 'View and manage your list of muted users. '}
      Muting a user will hide all that user's content from you.
    </HelpTopicView>
  );
};
