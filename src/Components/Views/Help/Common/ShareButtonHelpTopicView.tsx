import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ShareButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Share'} icon={AppIcons.share}>
      Share this content with other apps. Long press to open the share sheet, where you can copy a link, open it in a browser, or generate a QR code. The Use Advanced Sharing by Default setting makes a regular press open the sheet instead.
    </HelpTopicView>
  );
};
