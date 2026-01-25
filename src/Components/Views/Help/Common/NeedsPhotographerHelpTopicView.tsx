import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const NeedsPhotographerHelpTopicView = () => {
  return (
    <HelpTopicView title={'Needs Photographer'} icon={AppIcons.needsPhotographer}>
      Mark this event as needing a photographer. This option is only available to users with the Shutternaut Manager role.
    </HelpTopicView>
  );
};
