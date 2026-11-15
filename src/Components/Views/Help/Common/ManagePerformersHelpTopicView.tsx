import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ManagePerformersHelpTopicView = () => {
  return (
    <HelpTopicView title={'Manage Performers'} icon={AppIcons.twitarrteam}>
      Manually link any official or shadow performer to the event. Manually linked performers are kept when the official
      performer spreadsheet is re-imported.
    </HelpTopicView>
  );
};
