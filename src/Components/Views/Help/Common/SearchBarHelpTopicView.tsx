import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const SearchBarHelpTopicView = () => {
  return (
    <HelpTopicView title={'Search Bar'} icon={AppIcons.search}>
      Enter at least 3 characters to search. You can tap the search icon or press enter on your keyboard to execute the
      search. Results will appear below as you scroll.
    </HelpTopicView>
  );
};
