import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const EditButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Edit'} icon={AppIcons.edit}>
      Edit the conversation title and other properties. This option is only available if you are the owner of the
      conversation.
    </HelpTopicView>
  );
};
