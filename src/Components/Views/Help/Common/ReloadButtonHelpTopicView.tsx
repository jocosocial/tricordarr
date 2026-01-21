import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ReloadButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Reload'} icon={AppIcons.reload}>
      Refresh the conversation to load the latest messages.
    </HelpTopicView>
  );
};
