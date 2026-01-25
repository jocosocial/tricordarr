import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PhotographingHelpTopicView = () => {
  return (
    <HelpTopicView title={'Photographing'} icon={AppIcons.shutternaut}>
      Mark yourself as a photographer for this event. This option is only available to users with the Shutternaut role.
    </HelpTopicView>
  );
};
