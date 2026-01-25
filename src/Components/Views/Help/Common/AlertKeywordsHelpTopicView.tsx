import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const AlertKeywordsHelpTopicView = () => {
  return (
    <HelpTopicView title={'Alert Keywords'} icon={AppIcons.alertword}>
      You can set up alert words to ping you when someone makes a forum post containing a specific word. Alert words
      will be highlighted in content views like 🚨this🚨.
    </HelpTopicView>
  );
};
