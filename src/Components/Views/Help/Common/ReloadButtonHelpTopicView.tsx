import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ReloadButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Reload'} icon={AppIcons.reload}>
      Refresh this content to load the latest data from the server.
    </HelpTopicView>
  );
};
