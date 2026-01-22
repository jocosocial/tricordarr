import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ReportButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Report'} icon={AppIcons.report}>
      If you feel this content violates the Code of Conduct, you can report it to the moderator team for review.
    </HelpTopicView>
  );
};
