import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ScheduleSettingsHelpTopicView = () => {
  return (
    <>
      <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
        Configure schedule-related settings including late-night day flip, LFG integration, overlap exclusions, timezone
        labels, and notification preferences.
      </HelpTopicView>
      <HelpTopicView title={'Timezone Labels'}>
        Schedule times can show GMT offsets (the default, for example GMT-7), localized abbreviations (for example EST),
        or no timezone label. Change this in Schedule Settings. Offsets avoid ambiguous abbreviations such as MST, which
        can mean different regions.
      </HelpTopicView>
    </>
  );
};
