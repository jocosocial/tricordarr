import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const CopyButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Copy'} icon={AppIcons.copy}>
      Copy the text of this content to your device's clipboard.
    </HelpTopicView>
  );
};
