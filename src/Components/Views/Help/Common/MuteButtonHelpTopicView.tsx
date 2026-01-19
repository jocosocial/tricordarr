import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const MuteButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
      Mute or unmute the conversation to prevent generating notifications. You can also swipe on a conversation in the
      list to mute it.
    </HelpTopicView>
  );
};
