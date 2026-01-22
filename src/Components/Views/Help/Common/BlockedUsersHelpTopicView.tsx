import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface BlockedUsersHelpTopicViewProps {
  forListScreen?: boolean;
}

export const BlockedUsersHelpTopicView = ({forListScreen = true}: BlockedUsersHelpTopicViewProps = {}) => {
  return (
    <HelpTopicView title={forListScreen ? 'Blocked Users' : 'Block User'} icon={AppIcons.block}>
      {forListScreen && 'View and manage your list of blocked users. '}
      Blocking a user will hide all that user's content from you, and also hide all your content from them.
    </HelpTopicView>
  );
};
