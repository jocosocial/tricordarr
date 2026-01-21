import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const DetailsButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Details'} icon={AppIcons.details}>
      View the details screen for this conversation, including the list of participants and other internal information.
    </HelpTopicView>
  );
};
