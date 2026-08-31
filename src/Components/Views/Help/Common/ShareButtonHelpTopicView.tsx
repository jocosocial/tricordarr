import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ShareButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Share'} icon={AppIcons.share}>
      Share this content with other apps, copy a link, or generate a QR code.
    </HelpTopicView>
  );
};
