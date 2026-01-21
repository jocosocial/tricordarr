import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const HelpButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Help'} icon={AppIcons.help}>
      Open this help screen. Please let the TwitarrTeam know if you find any issues or have suggestions!
    </HelpTopicView>
  );
};
