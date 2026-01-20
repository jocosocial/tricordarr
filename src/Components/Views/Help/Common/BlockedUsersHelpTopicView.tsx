import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const BlockedUsersHelpTopicView = () => {
  return (
    <HelpTopicView title={'Blocked Users'} icon={AppIcons.block}>
      View and manage your list of blocked users. Blocking a user will hide all that user's content from you, and also
      hide all your content from them.
    </HelpTopicView>
  );
};
