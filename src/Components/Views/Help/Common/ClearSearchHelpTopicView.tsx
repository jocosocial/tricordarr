import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const ClearSearchHelpTopicView = () => {
  return (
    <HelpTopicView title={'Clear Search'} icon={AppIcons.close}>
      Tap the clear button in the search bar to clear your search query and results. This will prepare the screen for
      another search.
    </HelpTopicView>
  );
};
