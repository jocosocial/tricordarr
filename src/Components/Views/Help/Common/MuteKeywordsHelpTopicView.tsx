import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const MuteKeywordsHelpTopicView = () => {
  return (
    <HelpTopicView title={'Mute Keywords'} icon={AppIcons.mute}>
      You can set up mute words to prevent seeing forum posts containing a specific word.
    </HelpTopicView>
  );
};
