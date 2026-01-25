import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ScheduleImportHelpTopicView = () => {
  return (
    <HelpTopicView title={'Import'} icon={AppIcons.schedImport}>
      Import events from a Sched.com account. This will automatically favorite matching events in Twitarr based on your
      Sched.com favorites.
    </HelpTopicView>
  );
};
