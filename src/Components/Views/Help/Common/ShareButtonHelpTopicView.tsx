import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ShareButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Share'} icon={AppIcons.share}>
      Copy the current URL to the clipboard. Long press to open the current URL in your browser.
    </HelpTopicView>
  );
};
