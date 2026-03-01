import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ScheduleSettingsHelpTopicView = () => {
  return (
    <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
      Configure schedule-related settings including late-night day flip, LFG integration, overlap exclusions, and
      notification preferences.
    </HelpTopicView>
  );
};
